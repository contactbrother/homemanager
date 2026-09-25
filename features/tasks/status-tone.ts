import { OPEN_TASK_STATUSES, type TaskStatus } from "@/lib/constants";

/** Waiting on the client is the only status that asks something of them. */
export function statusTone(status: TaskStatus): "warn" | "quiet" | "ok" {
  if (status === "waiting_on_client") return "warn";
  return OPEN_TASK_STATUSES.includes(status) ? "quiet" : "ok";
}
