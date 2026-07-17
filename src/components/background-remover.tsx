"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { TurnstileWidget } from "./turnstile-widget";

const MAX_FILE_SIZE = 22 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png"]);
const ACCEPTED_EXTENSIONS = /\.(jpe?g|png)$/i;

type Phase = "idle" | "selected" | "verifying" | "processing" | "success" | "error";

type ApiError = {
  error?: { code?: string; message?: string; requestId?: string };
};

function emitEvent(event: string, properties: Record<string, string | number | boolean> = {}) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ event, properties }),
    keepalive: true,
  }).catch(() => undefined);
}

function displaySize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function BackgroundRemover() {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [requestId, setRequestId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [comparison, setComparison] = useState(50);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileVersion, setTurnstileVersion] = useState(0);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
  }, [originalUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const resetResult = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setResultUrl("");
    setError("");
    setRequestId("");
    setComparison(50);
  }, [resultUrl]);

  const selectFile = useCallback(
    (nextFile?: File) => {
      if (!nextFile) return;
      resetResult();

      if (!ACCEPTED_TYPES.has(nextFile.type) || !ACCEPTED_EXTENSIONS.test(nextFile.name)) {
        setPhase("error");
        setError("Please choose a JPG or PNG image.");
        emitEvent("validation_failed", { category: "invalid_file_type" });
        return;
      }
      if (nextFile.size > MAX_FILE_SIZE) {
        setPhase("error");
        setError("That image is larger than 22 MB. Choose a smaller file and try again.");
        emitEvent("validation_failed", { category: "file_too_large" });
        return;
      }
      if (nextFile.size === 0) {
        setPhase("error");
        setError("That file appears to be empty. Choose another image.");
        emitEvent("validation_failed", { category: "empty_file" });
        return;
      }

      if (originalUrl) URL.revokeObjectURL(originalUrl);
      setFile(nextFile);
      setOriginalUrl(URL.createObjectURL(nextFile));
      setPhase("selected");
      setTurnstileToken("");
      emitEvent("upload_select", {
        type: nextFile.type,
        size_bucket: nextFile.size < 5_000_000 ? "under_5mb" : nextFile.size < 15_000_000 ? "5_to_15mb" : "15_to_22mb",
      });
    },
    [originalUrl, resetResult],
  );

  function onFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files?.[0]);
  }

  async function removeBackground() {
    if (!file || phase === "processing" || phase === "verifying") return;
    if (siteKey && !turnstileToken) {
      setPhase("error");
      setError("Complete the quick security check, then try again.");
      return;
    }

    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setError("");
    setPhase(siteKey ? "verifying" : "processing");
    emitEvent("processing_started");
    const startedAt = performance.now();

    try {
      if (siteKey) {
        await new Promise((resolve) => setTimeout(resolve, 180));
        setPhase("processing");
      }

      const response = await fetch("/api/remove-background", {
        method: "POST",
        headers: {
          "content-type": file.type,
          "x-file-name": encodeURIComponent(file.name),
          "x-file-size": String(file.size),
          ...(turnstileToken ? { "x-turnstile-token": turnstileToken } : {}),
        },
        body: file,
        signal: controller.signal,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as ApiError;
        setRequestId(payload.error?.requestId ?? "");
        throw new Error(payload.error?.message ?? "We could not process that image. Please try again.");
      }

      const blob = await response.blob();
      if (!blob.type.startsWith("image/")) throw new Error("The service returned an unexpected result. Please try again.");
      const url = URL.createObjectURL(blob);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(url);
      setPhase("success");
      emitEvent("processing_succeeded", { duration_ms: Math.round(performance.now() - startedAt) });
    } catch (caught) {
      if (controller.signal.aborted) return;
      setPhase("error");
      setError(caught instanceof Error ? caught.message : "We could not process that image. Please try again.");
      emitEvent("processing_failed", { category: "request_failed" });
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      if (siteKey) {
        setTurnstileToken("");
        setTurnstileVersion((value) => value + 1);
      }
    }
  }

  function downloadResult() {
    if (!resultUrl || !file) return;
    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const anchor = document.createElement("a");
    anchor.href = resultUrl;
    anchor.download = `${baseName}-no-background.png`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    emitEvent("result_downloaded");
  }

  function uploadAnother() {
    resetResult();
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl("");
    setFile(null);
    setPhase("idle");
    setTurnstileToken("");
    emitEvent("upload_another");
    inputRef.current?.click();
  }

  const busy = phase === "processing" || phase === "verifying";

  return (
    <div className="tool-shell text-left">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-7">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span className="text-sm font-extrabold text-slate-900">Background remover</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5"><span aria-hidden="true">✓</span> JPG & PNG</span>
          <span className="flex items-center gap-1.5"><span aria-hidden="true">✓</span> Up to 22 MB</span>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" onChange={onFileInput} className="sr-only" aria-label="Choose an image" />

      {!file ? (
        <div className="p-4 sm:p-7">
          <div
            className="drop-zone px-6 text-center"
            data-dragging={isDragging}
            onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={onDrop}
          >
            <div>
              <div className="upload-icon" aria-hidden="true">↑</div>
              <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-950">Drop your image here</h2>
              <p className="mt-2 text-slate-500">or choose a file from your device</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="mt-7 rounded-full bg-slate-950 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200">
                Upload image
              </button>
              <p className="mt-5 text-xs font-medium text-slate-400">JPG or PNG · Maximum file size 22 MB</p>
            </div>
          </div>
          {phase === "error" && error ? (
            <div role="alert" className="mx-auto mt-4 max-w-xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">{error}</div>
          ) : null}
        </div>
      ) : (
        <div className="p-4 sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900">{file.name}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-400">{displaySize(file.size)}</p>
            </div>
            <button type="button" onClick={uploadAnother} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:text-slate-950">Choose another</button>
          </div>

          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            {phase === "success" && resultUrl ? (
              <div className="checkerboard absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl} alt="Image with the background removed" className="absolute inset-0 h-full w-full object-contain" />
                <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Original uploaded image" className="absolute inset-0 h-full w-full max-w-none object-contain" />
                </div>
                <div className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">Original</div>
                <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-emerald-600/90 px-3 py-1 text-[11px] font-bold text-white backdrop-blur">No background</div>
                <div className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-white shadow" style={{ left: `calc(${comparison}% - 1px)` }}>
                  <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-slate-950 text-sm font-black text-white shadow-xl">↔</span>
                </div>
                <input className="comparison-range" type="range" min="0" max="100" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} aria-label="Compare original and background-removed images" />
              </div>
            ) : (
              <div className="absolute inset-0 grid grid-cols-2">
                <div className="relative overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={originalUrl} alt="Selected image preview" className="h-full w-full object-contain" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/75 px-3 py-1 text-[11px] font-bold text-white">Original</span>
                </div>
                <div className="checkerboard relative grid place-items-center border-l border-white/70 px-5 text-center">
                  {busy ? (
                    <div role="status" aria-live="polite">
                      <span className="mx-auto block h-11 w-11 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
                      <p className="mt-4 text-sm font-extrabold text-slate-800">{phase === "verifying" ? "Verifying your request…" : "Removing background…"}</p>
                      <p className="mt-1 text-xs text-slate-500">This usually takes a few seconds.</p>
                    </div>
                  ) : (
                    <div>
                      <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-xl text-slate-400 shadow-sm" aria-hidden="true">✦</span>
                      <p className="mt-4 text-sm font-bold text-slate-600">Your result will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {phase === "error" && error ? (
            <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}{requestId ? <span className="mt-1 block text-xs font-medium text-red-500">Reference: {requestId}</span> : null}
            </div>
          ) : null}

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              {siteKey && phase !== "success" ? <TurnstileWidget key={turnstileVersion} siteKey={siteKey} onToken={setTurnstileToken} /> : (
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500"><span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100 text-emerald-700" aria-hidden="true">✓</span> Your image is not saved to our storage.</p>
              )}
            </div>
            {phase === "success" ? (
              <button type="button" onClick={downloadResult} className="rounded-full bg-emerald-600 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200">Download PNG ↓</button>
            ) : (
              <button type="button" onClick={removeBackground} disabled={busy || (Boolean(siteKey) && !turnstileToken)} className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">{busy ? "Working…" : phase === "error" ? "Try again" : "Remove background"}</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
