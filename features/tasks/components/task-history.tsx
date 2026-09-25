import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS, TASK_STATUS_LABELS_TEAM } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { TaskMessageWithAuthor } from "@/features/tasks/types";

/**
 * FR-028, FR-050. Notes and status changes in one chronological list, so a reopened
 * task reads as a sequence rather than a contradiction.
 */
export function TaskHistory({
  entries,
  audience,
}: {
  entries: TaskMessageWithAuthor[];
  audience: "client" | "team";
}) {
  const labels = audience === "team" ? TASK_STATUS_LABELS_TEAM : TASK_STATUS_LABELS;

  return (
    <ol className="space-y-4">
      {entries.map((entry) => {
        const who =
          entry.profiles?.role === "admin"
            ? "The team"
            : (entry.profiles?.full_name ?? "You");

        return (
          <li key={entry.id} className="border-l-2 border-[var(--line)] pl-4">
            <p className="text-[var(--mute)] text-[length:var(--text-small)]">
              {who} · {formatDate(entry.created_at)}
            </p>
            {entry.status_to ? (
              <p className="mt-1">
                Moved to <StatusPill>{labels[entry.status_to]}</StatusPill>
              </p>
            ) : null}
            {entry.body ? <p className="mt-1">{entry.body}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
