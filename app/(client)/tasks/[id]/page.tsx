import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getTask, listTaskHistory } from "@/features/tasks/queries";
import { TaskThread } from "@/features/tasks/components/task-thread";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { requireClient } from "@/features/auth/guards";
import { statusTone } from "@/features/tasks/status-tone";
import { Panel } from "@/components/ui/panel";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  return { title: task?.title ?? "Request" };
}

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
  const facts: Array<[string, string]> = [
    ["Home", task.properties?.name ?? ""],
    ["Sent", formatDate(task.created_at)],
    ["Last update", formatDate(task.updated_at)],
    ["Urgency", TASK_PRIORITY_LABELS[task.priority]],
  ];

  return (
    <div className="settle" key={id}>
      <Link
        href="/tasks"
        className="-ml-1 mb-2 inline-flex min-h-[44px] items-center gap-1 text-[var(--ink-soft)] hover:text-[var(--ink)] lg:hidden"
      >
        <ChevronLeft aria-hidden size={18} />
        All requests
      </Link>

      <header className="mb-5 lg:mt-[4px]">
        <h1 className="text-[length:var(--text-title)]">{task.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusPill tone={statusTone(task.status)}>{TASK_STATUS_LABELS[task.status]}</StatusPill>
          <PriorityPill priority={task.priority} />
        </div>
      </header>

      <div className="grid gap-4 md:gap-5">
        <Panel title="Details">
          <div className="px-4 py-4 md:px-5">
            {task.body ? (
              <p className="whitespace-pre-line">{task.body}</p>
            ) : (
              <p className="text-[var(--mute)]">No extra details were added.</p>
            )}
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[var(--line)] pt-4 sm:grid-cols-4">
              {facts
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[length:var(--text-small)] text-[var(--mute)]">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </Panel>

        <Panel title="History">
          <div className="px-4 py-5 md:px-5">
            <TaskThread
              taskId={id}
              entries={history}
              audience="client"
              authorName={profile.full_name ?? "You"}
              variant="timeline"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
