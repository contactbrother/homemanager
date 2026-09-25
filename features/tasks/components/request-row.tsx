import { PanelRow } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { statusTone } from "@/features/tasks/status-tone";
import { PriorityPill } from "./priority-pill";
import type { Task, TaskWithProperty } from "@/features/tasks/types";

/** One request as a row: what it is, where, when it last moved, and its state. */
export function RequestRow({
  task,
  showProperty = false,
  current = false,
}: {
  task: Task | TaskWithProperty;
  showProperty?: boolean;
  current?: boolean;
}) {
  const property = "properties" in task ? task.properties?.name : null;
  const meta = [showProperty ? property : null, `Updated ${formatDate(task.updated_at)}`]
    .filter(Boolean)
    .join(", ");

  return (
    <PanelRow href={`/tasks/${task.id}`} current={current}>
      <span className="block font-medium text-[var(--ink)]">{task.title}</span>
      <span className="mt-0.5 block text-[length:var(--text-small)] text-[var(--mute)]">{meta}</span>
      <span className="mt-2 flex flex-wrap gap-1.5">
        <StatusPill tone={statusTone(task.status)}>{TASK_STATUS_LABELS[task.status]}</StatusPill>
        <PriorityPill priority={task.priority} />
      </span>
    </PanelRow>
  );
}
