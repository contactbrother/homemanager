import { PanelRow } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { statusTone } from "@/features/tasks/status-tone";
import { PriorityPill } from "./priority-pill";
import type { Task, TaskWithProperty } from "@/features/tasks/types";

/** One request as a row: what it is, where, when it last moved, and its state. */
export function RequestRow({
  task,
  showProperty = false,
  current = false,
  unread = 0,
  lastActivity,
  href,
  statusLabels,
}: {
  task: Task | TaskWithProperty;
  showProperty?: boolean;
  current?: boolean;
  /** Updates from the team since this person last opened the request. */
  unread?: number;
  /** The latest message or change, when known; otherwise the request's own update time. */
  lastActivity?: string | null;
  /** Where the row leads; the team console opens its own request page. */
  href?: string;
  /** Wording for statuses; the team sees "Waiting on client" rather than "Waiting on you". */
  statusLabels?: Record<string, string>;
}) {
  const property = "properties" in task ? task.properties?.name : null;
  const when = lastActivity && lastActivity > task.updated_at ? lastActivity : task.updated_at;
  const meta = [showProperty ? property : null, formatRelative(when)].filter(Boolean).join(", ");

  return (
    <PanelRow href={href ?? `/tasks/${task.id}`} current={current}>
      <span className="flex items-start justify-between gap-3">
        <span className={`block text-[var(--ink)] ${unread ? "font-bold" : "font-medium"}`}>{task.title}</span>
        {unread ? (
          <span className="mt-0.5 inline-flex min-w-[22px] shrink-0 items-center justify-center rounded-full bg-[var(--accent)] px-1.5 text-[length:var(--text-tiny)] font-bold leading-[22px] text-white">
            {unread}
            <span className="sr-only"> new</span>
          </span>
        ) : null}
      </span>
      <span suppressHydrationWarning className={`mt-0.5 block text-[length:var(--text-small)] ${unread ? "font-semibold text-[var(--accent-text)]" : "text-[var(--mute)]"}`}>{meta}</span>
      <span className="mt-2 flex flex-wrap gap-1.5">
        <StatusPill tone={statusTone(task.status)}>{(statusLabels ?? TASK_STATUS_LABELS)[task.status]}</StatusPill>
        <PriorityPill priority={task.priority} />
      </span>
    </PanelRow>
  );
}
