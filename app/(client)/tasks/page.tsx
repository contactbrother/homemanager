import Link from "next/link";
import { listTasks } from "@/features/tasks/queries";
import { listProperties } from "@/features/properties/queries";
import { NewTaskSheet } from "@/features/tasks/components/new-task-sheet";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS, OPEN_TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Tasks" };

export default async function TasksPage() {
  const [tasks, properties] = await Promise.all([listTasks(), listProperties()]);

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Tasks</h1>

      {tasks.length === 0 ? (
        <EmptyState>No tasks yet.</EmptyState>
      ) : (
        <ul className="mt-6 space-y-3 settle">
          {tasks.map((task) => (
            <Card as="li" key={task.id}>
              <Link href={`/tasks/${task.id}`} className="block p-4 min-h-[44px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{task.title}</span>
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
                </div>
                <span className="mt-1 block text-[var(--mute)]">
                  {formatDate(task.created_at)}
                </span>
              </Link>
            </Card>
          ))}
        </ul>
      )}

      <div className="fixed bottom-[56px] inset-x-0 border-t border-[var(--line)] bg-[var(--ivory)]">
        <div className="mx-auto max-w-md px-5 py-3">
          <NewTaskSheet properties={properties} />
        </div>
      </div>
    </>
  );
}
