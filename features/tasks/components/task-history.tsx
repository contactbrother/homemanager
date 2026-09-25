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
  variant = "list",
}: {
  entries: TaskMessageWithAuthor[];
  audience: "client" | "team";
  /** list: the team layout. timeline: status changes as markers, notes as messages. */
  variant?: "list" | "timeline";
}) {
  const labels = audience === "team" ? TASK_STATUS_LABELS_TEAM : TASK_STATUS_LABELS;

  if (variant === "timeline") {
    if (entries.length === 0) {
      return <p className="text-[var(--mute)]">No updates yet. We will post here as soon as we start.</p>;
    }
    return (
      <ol className="relative space-y-5 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--line)]">
        {entries.map((entry) => {
          const team = entry.profiles?.role === "admin";
          const who = team ? "Dar" : "You";
          return (
            <li key={entry.id} className="relative pl-7">
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-[3px] border-[var(--surface)] ${
                  entry.status_to ? "bg-[var(--accent)]" : team ? "bg-[var(--sand)]" : "bg-[var(--line-strong)]"
                }`}
              />
              <p className="text-[length:var(--text-small)] text-[var(--mute)]">
                <span className="font-semibold text-[var(--ink-soft)]">{who}</span>, {formatDate(entry.created_at)}
              </p>
              {entry.status_to ? (
                <p className="mt-1">
                  Moved to <StatusPill>{labels[entry.status_to]}</StatusPill>
                </p>
              ) : null}
              {entry.body ? (
                <p
                  className={`mt-1.5 whitespace-pre-line rounded-[var(--r-md)] px-3.5 py-2.5 ${
                    team ? "bg-[var(--accent-soft)]" : "bg-[var(--surface-2)]"
                  }`}
                >
                  {entry.body}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    );
  }

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
