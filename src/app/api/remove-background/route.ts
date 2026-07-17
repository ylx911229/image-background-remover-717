import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 22 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png"]);
const encoder = new TextEncoder();

function jsonError(status: number, code: string, message: string, requestId: string) {
  return Response.json(
    { error: { code, message, requestId } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

async function runtimeEnv(): Promise<CloudflareEnv> {
  try {
    const cloudflareEnv = (await getCloudflareContext({ async: true })).env as CloudflareEnv;
    return {
      ...cloudflareEnv,
      REMOVE_BG_API_KEY: cloudflareEnv.REMOVE_BG_API_KEY ?? process.env.REMOVE_BG_API_KEY,
      TURNSTILE_SECRET_KEY: cloudflareEnv.TURNSTILE_SECRET_KEY ?? process.env.TURNSTILE_SECRET_KEY,
      NEXT_PUBLIC_SITE_URL: cloudflareEnv.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL,
    };
  } catch {
    return {
      REMOVE_BG_API_KEY: process.env.REMOVE_BG_API_KEY,
      TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    };
  }
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function verifyTurnstile(secret: string, token: string, remoteIp?: string) {
  const form = new URLSearchParams({ secret, response: token });
  if (remoteIp) form.set("remoteip", remoteIp);
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form,
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

function safeFilename(value: string | null) {
  let decoded = value ?? "image";
  try { decoded = decodeURIComponent(decoded); } catch { /* use raw header */ }
  const cleaned = decoded.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 100);
  return cleaned || "image";
}

function multipartStream(source: ReadableStream<Uint8Array>, boundary: string, filename: string, contentType: string) {
  const prefix = encoder.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="image_file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`,
  );
  const suffix = encoder.encode(
    `\r\n--${boundary}\r\nContent-Disposition: form-data; name="size"\r\n\r\nauto\r\n--${boundary}--\r\n`,
  );
  const reader = source.getReader();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(prefix);
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.enqueue(suffix);
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) { void reader.cancel(reason); },
  });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const env = await runtimeEnv();
  const remoteIp = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

  if (!isSameOrigin(request)) {
    return jsonError(403, "ORIGIN_REJECTED", "This request is not allowed.", requestId);
  }

  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!ALLOWED_TYPES.has(contentType)) {
    return jsonError(400, "INVALID_FILE_TYPE", "Please upload a JPG or PNG image.", requestId);
  }

  const declaredSize = Number(request.headers.get("x-file-size") ?? request.headers.get("content-length") ?? 0);
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declaredSize) || declaredSize <= 0) {
    return jsonError(400, "INVALID_REQUEST", "The image size could not be verified.", requestId);
  }
  if (declaredSize > MAX_FILE_SIZE || contentLength > MAX_FILE_SIZE) {
    return jsonError(413, "FILE_TOO_LARGE", "Please upload an image smaller than 22 MB.", requestId);
  }
  if (!request.body) {
    return jsonError(400, "INVALID_REQUEST", "No image was received.", requestId);
  }

  if (env.API_RATE_LIMITER) {
    const key = remoteIp ? `image:${remoteIp}` : "image:anonymous";
    const { success } = await env.API_RATE_LIMITER.limit({ key });
    if (!success) return jsonError(429, "RATE_LIMITED", "Too many requests. Please wait a minute and try again.", requestId);
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const token = request.headers.get("x-turnstile-token") ?? "";
    if (!token || !(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, token, remoteIp))) {
      return jsonError(403, "VERIFICATION_FAILED", "The security check expired. Please complete it again.", requestId);
    }
  }

  if (!env.REMOVE_BG_API_KEY) {
    return jsonError(503, "SERVICE_UNAVAILABLE", "The background removal service is not configured yet.", requestId);
  }

  const boundary = `clearcut-${crypto.randomUUID()}`;
  const body = multipartStream(request.body, boundary, safeFilename(request.headers.get("x-file-name")), contentType);

  try {
    const init = {
      method: "POST",
      headers: {
        "x-api-key": env.REMOVE_BG_API_KEY,
        "content-type": `multipart/form-data; boundary=${boundary}`,
      },
      body,
      signal: AbortSignal.timeout(60_000),
      duplex: "half",
    } satisfies RequestInit & { duplex: "half" };
    const upstream = await fetch("https://api.remove.bg/v1.0/removebg", init);

    if (!upstream.ok) {
      void upstream.body?.cancel();
      if (upstream.status === 400) return jsonError(400, "INVALID_IMAGE", "We could not find a clear foreground subject. Try another image.", requestId);
      if (upstream.status === 429) return jsonError(429, "RATE_LIMITED", "The service is busy. Please wait a moment and try again.", requestId);
      if (upstream.status === 402 || upstream.status === 403) return jsonError(503, "SERVICE_UNAVAILABLE", "The background removal service is temporarily unavailable.", requestId);
      return jsonError(502, "UPSTREAM_ERROR", "We could not process that image. Please try again.", requestId);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "image/png",
        "cache-control": "no-store, private, max-age=0",
        "content-disposition": "inline; filename=clearcut-result.png",
        "x-request-id": requestId,
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return jsonError(504, "UPSTREAM_TIMEOUT", "Processing took too long. Please try again.", requestId);
    }
    console.error(JSON.stringify({ event: "remove_background_failed", requestId, category: "upstream_exception" }));
    return jsonError(502, "UPSTREAM_ERROR", "We could not process that image. Please try again.", requestId);
  }
}
