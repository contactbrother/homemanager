import Link from "next/link";
import { listTasks } from "@/features/tasks/queries";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { TASK_STATUS_LABELS, OPEN_TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Requests" };

export default async function TasksPage() {
  const tasks = await listTasks();

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Requests</h1>

      {tasks.length === 0 ? (
        <EmptyState>No requests yet. Use New request to send us anything that needs doing at home.</EmptyState>
      ) : (
        <ul className="mt-6 space-y-3 settle">
          {tasks.map((task) => (
            <Card as="li" key={task.id}>
              <Link href={`/tasks/${task.id}`} className="block p-4 min-h-[44px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{task.title}</span>
                  <span className="flex shrink-0 gap-1.5">
                  <PriorityPill priority={task.priority} />
                  <StatusPill
                    tone={
                      task.status === "waiting_on_client"
                        ? "warn"
                        : OPEN_TASK_STATUSES.includes(task.status)
                          ? "quiet"
                          : "ok"
                    }
                  >
                    {TASK_STATUS_LABELS[task.status]}
                  </StatusPill>
                  </span>
                </div>
                <span className="mt-1 block text-[var(--mute)]">
                  {formatDate(task.created_at)}
                </span>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}
