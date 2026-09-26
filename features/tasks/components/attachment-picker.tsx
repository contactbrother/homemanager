"use client";

import { useRef } from "react";
import { Camera, Play, X } from "lucide-react";
import { MAX_ATTACHMENTS, pickFile, type PickedFile } from "@/features/tasks/upload";

/** The attach button. Phones offer the camera, photo library and files in one sheet. */
export function AttachButton({
  picked,
  onChange,
  onError,
  compact = false,
  disabled = false,
}: {
  picked: PickedFile[];
  onChange: (next: PickedFile[]) => void;
  onError: (message: string | null) => void;
  compact?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);

  function add(files: FileList | null) {
    if (!files) return;
    onError(null);
    const next = [...picked];
    for (const file of Array.from(files)) {
      if (next.length >= MAX_ATTACHMENTS) {
        onError(`Up to ${MAX_ATTACHMENTS} photos or videos at a time.`);
        break;
      }
      const result = pickFile(file);
      if (typeof result === "string") onError(result);
      else next.push(result);
    }
    onChange(next);
    if (input.current) input.current.value = "";
  }

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/*,video/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => add(e.target.files)}
      />
      {compact ? (
        <button
          type="button"
          aria-label="Add photos or videos"
          disabled={disabled || picked.length >= MAX_ATTACHMENTS}
          onClick={() => input.current?.click()}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--ink-soft)] transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--line)] disabled:opacity-40"
        >
          <Camera aria-hidden size={22} strokeWidth={1.75} />
        </button>
      ) : (
        <button
          type="button"
          disabled={disabled || picked.length >= MAX_ATTACHMENTS}
          onClick={() => input.current?.click()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[var(--r-md)] border border-dashed border-[var(--line-strong)] px-4 font-medium text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent-text)] disabled:opacity-40"
        >
          <Camera aria-hidden size={20} strokeWidth={1.75} />
          Add photos or videos
        </button>
      )}
    </>
  );
}

/** Thumbnails of what is about to be sent, each removable. */
export function PickedStrip({
  picked,
  onRemove,
}: {
  picked: PickedFile[];
  onRemove: (id: string) => void;
}) {
  if (picked.length === 0) return null;
  return (
    <ul className="flex gap-2 overflow-x-auto pb-1">
      {picked.map((p) => (
        <li key={p.id} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--r-md)] bg-[var(--line)]">
          {p.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <video src={p.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />
              <Play aria-hidden size={18} className="absolute inset-0 m-auto fill-white text-white drop-shadow" />
            </>
          )}
          <button
            type="button"
            aria-label="Remove"
            onClick={() => onRemove(p.id)}
            className="absolute right-0.5 top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ink)]/75 text-white"
          >
            <X aria-hidden size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
