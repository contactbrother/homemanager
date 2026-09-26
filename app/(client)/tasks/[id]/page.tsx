import { notFound } from "next/navigation";
import { getTask, listTaskHistory } from "@/features/tasks/queries";
import { TaskThread } from "@/features/tasks/components/task-thread";
import { LiveThread } from "@/features/tasks/components/live-thread";
import { getMyActivity } from "@/features/tasks/activity";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { requireClient } from "@/features/auth/guards";
import { statusTone } from "@/features/tasks/status-tone";
import { ScreenBar } from "@/components/shell/screen-bar";
import { PhoneCollapsible } from "@/components/ui/collapsible";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  return { title: task?.title ?? "Request" };
}

/**
 * On a phone a request is a full-screen conversation: its own top bar, the details
 * folded into one line, the history, and a message box docked above the keyboard.
 * From tablet up it keeps the panel layout beside the request list.
 */
export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireClient();
  const task = await getTask(id);
  if (!task) notFound();

  const [history, activity] = await Promise.all([listTaskHistory(id), getMyActivity()]);
  const hadUnread = (activity.get(id)?.unread ?? 0) > 0;
  const status = TASK_STATUS_LABELS[task.status];
  const facts: Array<[string, string]> = [
    ["Home", task.properties?.name ?? ""],
    ["Sent", formatDate(task.created_at)],
    ["Last update", formatDate(task.updated_at)],
    ["Urgency", TASK_PRIORITY_LABELS[task.priority]],
  ];

  return (
    <div key={id}>
      <LiveThread taskId={id} hadUnread={hadUnread} />
      <ScreenBar backHref="/tasks" backLabel="All requests" title={task.title} subtitle={status} />

      <header className="mb-5 hidden md:block">
        <h1 className="text-[length:var(--text-title)]">{task.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusPill tone={statusTone(task.status)}>{status}</StatusPill>
          <PriorityPill priority={task.priority} />
        </div>
      </header>

      <section className="border-b border-[var(--line)] bg-[var(--surface)] px-4 md:mb-5 md:rounded-[var(--r-lg)] md:border md:px-5 md:py-4">
        <h2 className="hidden text-[length:var(--text-heading)] md:block md:mb-3">Details</h2>
        <PhoneCollapsible
          summary={
            <span className="flex flex-wrap items-center gap-1.5">
              <StatusPill tone={statusTone(task.status)}>{status}</StatusPill>
              <PriorityPill priority={task.priority} />
              <span className="text-[length:var(--text-small)] text-[var(--mute)]">Details</span>
            </span>
          }
        >
          {task.body ? (
            <p className="whitespace-pre-line">{task.body}</p>
          ) : (
            <p className="text-[var(--mute)]">No extra details were added.</p>
          )}
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--line)] pt-4 pb-3 sm:grid-cols-4 md:pb-0">
            {facts
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[length:var(--text-small)] text-[var(--mute)]">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
          </dl>
        </PhoneCollapsible>
      </section>

      <section className="px-4 pt-5 md:rounded-[var(--r-lg)] md:border md:border-[var(--line)] md:bg-[var(--surface)] md:px-5 md:pb-5">
        <h2 className="mb-4 text-[length:var(--text-heading)]">History</h2>
        <TaskThread
          taskId={id}
          entries={history}
          audience="client"
          authorName={profile.full_name ?? "You"}
          variant="timeline"
        />
      </section>
    </div>
  );
}
