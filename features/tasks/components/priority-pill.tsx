import { StatusPill } from "@/components/ui/status-pill";
import { TASK_PRIORITY_LABELS, type TaskPriority } from "@/lib/constants";

/** Normal carries no colour: a calm list stays calm. Only the ends of the scale show. */
export function PriorityPill({ priority }: { priority: TaskPriority }) {
  if (priority === "normal") return null;
  const tone = priority === "emergency" ? "alert" : priority === "high" ? "warn" : "quiet";
  return <StatusPill tone={tone}>{TASK_PRIORITY_LABELS[priority]}</StatusPill>;
}
