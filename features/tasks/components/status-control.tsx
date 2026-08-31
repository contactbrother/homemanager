"use client";

import { useOptimistic, useState, useTransition } from "react";
import { renameTask, setTaskStatus } from "@/features/tasks/actions";
import { Button } from "@/components/ui/button";
import { TASK_STATUSES, TASK_STATUS_LABELS_TEAM, type TaskStatus } from "@/lib/constants";

/**
 * FR-049. Any status to any status, including reopening. No transition rules, so this
 * is a plain select rather than a set of permitted moves.
 *
 * FR-041: the pill updates optimistically and reverts visibly if the server refuses.
 */
export function StatusControl({
  taskId,
  status,
  title,
}: {
  taskId: string;
  status: TaskStatus;
  title: string;
}) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [error, setError] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [pending, start] = useTransition();

  function change(next: TaskStatus) {
    setError(null);
    start(async () => {
      setOptimistic(next);
      // Haptics where supported. iOS Safari does not implement the Vibration API,
      // so a large share of clients will feel nothing. research.md R8.
      navigator.vibrate?.(12);
      const result = await setTaskStatus({ taskId, status: next });
      // On failure the optimistic value is discarded when the transition ends,
      // so the pill returns to the server's value on its own. FR-041.
      if (!result.ok) setError(result.error);
    });
  }

  function rename() {
    setError(null);
    start(async () => {
      const result = await renameTask({ taskId, title: draftTitle });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRenaming(false);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={optimistic}
          disabled={pending}
          onChange={(e) => change(e.target.value as TaskStatus)}
          className="min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
        >
          {TASK_STATUSES.map((value) => (
            <option key={value} value={value}>
              {TASK_STATUS_LABELS_TEAM[value]}
            </option>
          ))}
        </select>

        {renaming ? null : (
          <Button variant="text" onClick={() => setRenaming(true)}>
            Rename
          </Button>
        )}
      </div>

      {renaming ? (
        <div className="flex flex-wrap items-center gap-3">
          <input
            aria-label="Task title"
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            className="min-h-[44px] flex-1 px-4 rounded-[var(--r-md)] border border-[var(--line)]"
          />
          <Button variant="outline" onClick={rename} disabled={pending}>
            Save
          </Button>
          <Button variant="text" onClick={() => setRenaming(false)}>
            Cancel
          </Button>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
