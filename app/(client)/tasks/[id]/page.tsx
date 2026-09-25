import { notFound } from "next/navigation";
import { getTask, listTaskHistory } from "@/features/tasks/queries";
import { TaskThread } from "@/features/tasks/components/task-thread";
import { requireClient } from "@/features/auth/guards";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS, OPEN_TASK_STATUSES } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { PriorityPill } from "@/features/tasks/components/priority-pill";

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireClient();
  const task = await getTask(id);
  if (!task) notFound();

  const history = await listTaskHistory(id);

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">{task.title}</h1>
      <div className="mt-2 flex items-center gap-3">
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
        <PriorityPill priority={task.priority} />
        <span className="text-[var(--mute)]">{formatDate(task.created_at)}</span>
      </div>

      {task.body ? <p className="mt-4">{task.body}</p> : null}

      <h2 className="mt-8 text-[length:var(--text-heading)]">History</h2>
      <div className="mt-4">
        <TaskThread
          taskId={id}
          entries={history}
          audience="client"
          authorName={profile.full_name ?? "You"}
        />
      </div>
    </>
  );
}
