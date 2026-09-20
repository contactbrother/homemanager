"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addTaskNote } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function AddNote({
  taskId,
  label = "Add a note",
  onOptimistic,
}: {
  taskId: string;
  label?: string;
  /** Shows the note in the history before the server has stored it. FR-041. */
  onOptimistic?: (body: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function send() {
    const sent = body.trim();
    if (!sent) {
      setError("Write a note first.");
      return;
    }
    setError(null);
    setOpen(false);
    onOptimistic?.(sent);

    start(async () => {
      const result = await addTaskNote({ taskId, body: sent });
      // Cleared either way: on success the server row replaces it, on failure it
      // must visibly disappear rather than sit there looking sent. FR-041.
      onOptimistic?.(null);
      if (!result.ok) {
        setError(result.error);
        setBody(sent);
        setOpen(true);
        return;
      }
      navigator.vibrate?.(12);
      setBody("");
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <div>
            <label htmlFor="note" className="block mb-2">
              Your note
            </label>
            <textarea
              id="note"
              rows={4}
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-3"
            />
          </div>

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Sending" : "Send"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
