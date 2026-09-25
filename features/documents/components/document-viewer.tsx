"use client";

import { useEffect, useRef, useState } from "react";
import { getDocumentUrl } from "@/features/documents/actions";
import { ScreenBarActions } from "./viewer-actions";

type State =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready"; blob: Blob };

const PDF_WORKER = "/pdfjs/pdf.worker-4.10.38.min.mjs";

/**
 * Documents open inside Dar rather than in a new browser tab, so Back always returns
 * to where the client came from. The file is fetched once through a short-lived signed
 * URL; download and share use that same copy, so they keep working after the link expires.
 */
export function DocumentViewer({
  documentId,
  title,
  mimeType,
  fileName,
}: {
  documentId: string;
  title: string;
  mimeType: string | null;
  fileName: string;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [pages, setPages] = useState(0);
  const pagesRef = useRef<HTMLDivElement>(null);
  const isPdf = (mimeType ?? "").includes("pdf") || fileName.toLowerCase().endsWith(".pdf");
  const isImage = (mimeType ?? "").startsWith("image/");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getDocumentUrl(documentId);
      if (!result.ok) {
        if (!cancelled) setState({ kind: "error", message: result.error });
        return;
      }
      try {
        const response = await fetch(result.data.url);
        if (!response.ok) throw new Error(String(response.status));
        const blob = await response.blob();
        if (!cancelled) setState({ kind: "ready", blob });
      } catch {
        if (!cancelled) {
          setState({ kind: "error", message: "The file did not load. Check your connection and try again." });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Draw each PDF page to a canvas sized to the screen, sharp on high-density displays.
  useEffect(() => {
    if (state.kind !== "ready" || !isPdf || !pagesRef.current) return;
    const container = pagesRef.current;
    let cancelled = false;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER;
        const data = new Uint8Array(await state.blob.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        setPages(pdf.numPages);
        container.innerHTML = "";
        const width = container.clientWidth;
        const ratio = Math.min(window.devicePixelRatio || 1, 3);

        for (let n = 1; n <= pdf.numPages; n++) {
          if (cancelled) return;
          const page = await pdf.getPage(n);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (width / base.width) * ratio });
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          canvas.setAttribute("aria-label", `Page ${n} of ${pdf.numPages}`);
          canvas.className = "block rounded-[var(--r-sm)] bg-white shadow-[0_1px_3px_rgba(24,34,30,0.12)]";
          container.appendChild(canvas);
          const context = canvas.getContext("2d");
          if (context) await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch {
        if (!cancelled) {
          setState({ kind: "error", message: "This PDF could not be shown here. Download it to open it on your device." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, isPdf]);

  const blob = state.kind === "ready" ? state.blob : null;

  return (
    <div>
      <ScreenBarActions blob={blob} fileName={fileName} title={title} />

      <div className="px-3 pt-3 md:px-0 md:pt-0">
        {state.kind === "loading" ? (
          <div aria-live="polite" className="space-y-3">
            <div className="aspect-[1/1.414] w-full animate-pulse rounded-[var(--r-sm)] bg-[var(--line)]" />
            <p className="text-center text-[length:var(--text-small)] text-[var(--mute)]">Opening {title}</p>
          </div>
        ) : null}

        {state.kind === "error" ? (
          <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
            <p className="font-semibold">{title} did not open</p>
            <p className="mx-auto mt-2 max-w-sm text-[var(--mute)]">{state.message}</p>
          </div>
        ) : null}

        {state.kind === "ready" && isPdf ? (
          <>
            <div ref={pagesRef} className="mx-auto flex max-w-3xl flex-col gap-3" />
            {pages > 1 ? (
              <p className="mt-3 text-center text-[length:var(--text-small)] text-[var(--mute)]">
                {pages} pages
              </p>
            ) : null}
          </>
        ) : null}

        {state.kind === "ready" && isImage ? <ImagePreview blob={state.blob} title={title} /> : null}

        {state.kind === "ready" && !isPdf && !isImage ? (
          <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
            <p className="font-semibold">No preview for this file type</p>
            <p className="mx-auto mt-2 max-w-sm text-[var(--mute)]">
              Use Download or Share to open it in another app.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ImagePreview({ blob, title }: { blob: Blob; title: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={title} className="mx-auto block max-w-full rounded-[var(--r-sm)]" />;
}

