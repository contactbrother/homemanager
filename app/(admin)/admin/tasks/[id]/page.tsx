import { notFound } from "next/navigation";
import { getTask, listRequestAttachments, listTaskHistory } from "@/features/tasks/queries";
import { TaskThread } from "@/features/tasks/components/task-thread";
import { AttachmentGrid } from "@/features/tasks/components/attachment-grid";
import { StatusControl } from "@/features/tasks/components/status-control";
import { formatDate } from "@/lib/format";

export default async function AdminTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  const [history, requestFiles] = await Promise.all([listTaskHistory(id), listRequestAttachments(id)]);

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--text-title)]">{task.title}</h1>
          <p className="mt-1 text-[var(--mute)]">
            {task.properties?.name ?? "Unknown property"} ·{" "}
            {formatDate(task.created_at)}
          </p>
        </div>
      </div>

      {task.body ? <p className="mt-4">{task.body}</p> : null}
      {requestFiles.length ? <AttachmentGrid items={requestFiles} /> : null}

      <div className="mt-6">
        <StatusControl
          taskId={id}
          status={task.status}
          priority={task.priority}
          title={task.title}
        />
      </div>

      <h2 className="mt-8 text-[length:var(--text-heading)]">History</h2>
      <div className="mt-4">
        {/* Reply is the primary action. Status is a control, not a competing button. */}
        <TaskThread
          taskId={id}
          entries={history}
          audience="team"
          authorName="The team"
          label="Reply"
        />
      </div>
    </>
  );
}
