const ALLOWED_EVENTS = new Set([
  "upload_select",
  "validation_failed",
  "processing_started",
  "processing_succeeded",
  "processing_failed",
  "result_downloaded",
  "upload_another",
]);

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > 1_024) return new Response(null, { status: 413 });

  try {
    const payload = (await request.json()) as { event?: string; properties?: Record<string, unknown> };
    if (!payload.event || !ALLOWED_EVENTS.has(payload.event)) return new Response(null, { status: 400 });
    const safeProperties = Object.fromEntries(
      Object.entries(payload.properties ?? {})
        .filter(([key, value]) => /^[a-z_]{1,32}$/.test(key) && ["string", "number", "boolean"].includes(typeof value))
        .slice(0, 8),
    );
    console.info(JSON.stringify({ event: payload.event, properties: safeProperties }));
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
}
