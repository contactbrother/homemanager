"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

export interface ShownAttachment {
  id: string;
  url?: string | null;
  mime_type: string;
}

/** Photos and videos in a message, as a tidy grid. Tap one to see it full screen. */
export function AttachmentGrid({ items }: { items: ShownAttachment[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const shown = items.filter((i) => i.url);
  if (shown.length === 0) return null;
  const cols = shown.length === 1 ? "grid-cols-1 max-w-[280px]" : "grid-cols-2 max-w-[320px] sm:grid-cols-3 sm:max-w-[420px]";

  return (
    <>
      <ul className={`mt-2 grid gap-1.5 ${cols}`}>
        {shown.map((item, i) => {
          const video = item.mime_type.startsWith("video/");
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={video ? "Play video" : "Open photo"}
                className={`relative block w-full overflow-hidden rounded-[var(--r-md)] bg-[var(--line)] ${shown.length === 1 ? "aspect-[4/3]" : "aspect-square"}`}
              >
                {video ? (
                  <>
                    <video src={`${item.url}#t=0.1`} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                    <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55">
                        <Play aria-hidden size={20} className="ml-0.5 fill-white text-white" />
                      </span>
                    </span>
                  </>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url!} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
      {open !== null ? <Lightbox items={shown} index={open} onClose={() => setOpen(null)} onIndex={setOpen} /> : null}
    </>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onIndex,
}: {
  items: ShownAttachment[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const item = items[index];
  const prev = useCallback(() => onIndex((index - 1 + items.length) % items.length), [index, items.length, onIndex]);
  const next = useCallback(() => onIndex((index + 1) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", key);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
    };
  }, [onClose, prev, next]);

  // Swipe left or right on phones.
  const [startX, setStartX] = useState<number | null>(null);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo or video"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/92"
      onClick={onClose}
      onTouchStart={(e) => setStartX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
        setStartX(null);
      }}
    >
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-[calc(8px+env(safe-area-inset-top))]">
        <span className="px-2 text-[length:var(--text-small)] text-white/80">
          {items.length > 1 ? `${index + 1} of ${items.length}` : ""}
        </span>
        <button type="button" aria-label="Close" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/10">
          <X aria-hidden size={24} />
        </button>
      </div>

      <div className="max-h-full max-w-full p-4" onClick={(e) => e.stopPropagation()}>
        {item.mime_type.startsWith("video/") ? (
          <video key={item.id} src={item.url!} controls autoPlay playsInline className="max-h-[80dvh] max-w-full rounded-[var(--r-md)]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={item.id} src={item.url!} alt="" className="max-h-[85dvh] max-w-full rounded-[var(--r-md)] object-contain" />
        )}
      </div>

      {items.length > 1 ? (
        <>
          <button type="button" aria-label="Previous" onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:inline-flex">
            <ChevronLeft aria-hidden size={26} />
          </button>
          <button type="button" aria-label="Next" onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:inline-flex">
            <ChevronRight aria-hidden size={26} />
          </button>
        </>
      ) : null}
    </div>
  );
}
