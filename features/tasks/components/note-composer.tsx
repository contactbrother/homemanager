"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { addTaskNote } from "@/features/tasks/actions";
import { uploadAttachments, type PickedFile } from "@/features/tasks/upload";
import { AttachButton, PickedStrip } from "./attachment-picker";
import type { ShownAttachment } from "./attachment-grid";

/**
 * A message box like a chat app's. On phones it is docked to the bottom of the screen
 * and rides above the keyboard; from tablet up it sits at the end of the history.
 * The note shows in the history at once and is removed again if the server refuses.
 */
export function NoteComposer({
  taskId,
  propertyId,
  onOptimistic,
  placeholder = "Write a note to the team",
}: {
  taskId: string;
  propertyId?: string;
  onOptimistic: (body: string | null, attachments?: ShownAttachment[]) => void;
  placeholder?: string;
}) {
  const [body, setBody] = useState("");
  const [picked, setPicked] = useState<PickedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const dock = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  // iOS keeps fixed elements behind the keyboard. Lift the dock by the keyboard height.
  useEffect(() => {
    const vv = window.visualViewport;
    const el = dock.current;
    if (!vv || !el) return;
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.setProperty("--kb", `${Math.round(offset)}px`);
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  // Grow with the text, up to about five lines, then scroll inside.
  useEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [body]);

  function send() {
    const sent = body.trim();
    const files = picked;
    if ((!sent && files.length === 0) || pending || uploading) return;
    setError(null);
    setBody("");
    setPicked([]);
    onOptimistic(
      sent || null,
      files.map((f) => ({ id: f.id, url: f.preview, mime_type: f.file.type || (f.kind === "video" ? "video/mp4" : "image/jpeg") })),
    );
    requestAnimationFrame(() =>
      document.getElementById("thread-end")?.scrollIntoView({ behavior: "smooth", block: "end" }),
    );

    start(async () => {
      let attachments;
      if (files.length) {
        if (!propertyId) {
          onOptimistic(null);
          setError("Photos cannot be attached here.");
          return;
        }
        setUploading(true);
        try {
          attachments = await uploadAttachments(propertyId, taskId, files);
        } catch {
          setUploading(false);
          onOptimistic(null);
          setError("The photos did not upload. Check your connection and try again.");
          setBody(sent);
          setPicked(files);
          return;
        }
        setUploading(false);
      }
      const result = await addTaskNote({ taskId, body: sent, attachments });
      onOptimistic(null);
      if (!result.ok) {
        setError(result.error);
        setBody(sent);
        return;
      }
      navigator.vibrate?.(12);
      router.refresh();
    });
  }

  return (
    <div
      ref={dock}
      className="fixed inset-x-0 bottom-[var(--kb,0px)] z-30 border-t border-[var(--line)] bg-[var(--surface)] px-3 pt-2.5 pb-[max(10px,env(safe-area-inset-bottom))] md:static md:z-auto md:mt-6 md:border-t md:bg-transparent md:px-0 md:pb-0 md:pt-4"
    >
      {error ? (
        <p role="alert" className="mb-2 px-1 text-[length:var(--text-small)] text-[var(--alert)]">
          {error}
        </p>
      ) : null}
      {uploading ? (
        <p aria-live="polite" className="mb-2 px-1 text-[length:var(--text-small)] text-[var(--mute)]">
          Uploading {picked.length || ""} {picked.length === 1 ? "file" : "files"}
        </p>
      ) : null}
      <div className="mb-2 empty:hidden">
        <PickedStrip picked={picked} onRemove={(id) => setPicked((p) => p.filter((x) => x.id !== id))} />
      </div>
      <form
        className="flex items-end gap-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        {propertyId ? (
          <AttachButton picked={picked} onChange={setPicked} onError={setError} compact disabled={pending || uploading} />
        ) : null}
        <label htmlFor={`note-${taskId}`} className="sr-only">
          Note to the team
        </label>
        <textarea
          ref={field}
          id={`note-${taskId}`}
          rows={1}
          value={body}
          placeholder={placeholder}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends on a keyboard; phones keep Enter for new lines.
            if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
              e.preventDefault();
              send();
            }
          }}
          className="max-h-[132px] min-h-[44px] flex-1 resize-none rounded-[22px] bg-[var(--surface-2)] px-4 py-[10px] leading-[1.4]"
        />
        <button
          type="submit"
          aria-label="Send note"
          disabled={(!body.trim() && picked.length === 0) || pending || uploading}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white transition-[transform,opacity] duration-[var(--fast)] active:scale-95 disabled:opacity-35"
        >
          <ArrowUp aria-hidden size={20} strokeWidth={2.5} />
        </button>
      </form>
    </div>
  );
}
