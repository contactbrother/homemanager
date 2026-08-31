import Link from "next/link";
import { listAllTasks } from "@/features/tasks/queries";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUSES, TASK_STATUS_LABELS_TEAM, type TaskStatus } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Task queue" };

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = TASK_STATUSES.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : undefined;

  const tasks = await listAllTasks(filter);

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Task queue</h1>

      <nav aria-label="Filter by status" className="mt-4 flex flex-wrap gap-2">
        <FilterLink current={filter} value={undefined} label="All" />
        {TASK_STATUSES.map((value) => (
          <FilterLink
            key={value}
            current={filter}
            value={value}
            label={TASK_STATUS_LABELS_TEAM[value]}
          />
        ))}
      </nav>

      {tasks.length === 0 ? (
        <EmptyState>Nothing in this filter.</EmptyState>
      ) : (
        <ul className="mt-6 space-y-3">
          {tasks.map((task) => (
            <Card as="li" key={task.id}>
              <Link href={`/admin/tasks/${task.id}`} className="block p-4 min-h-[44px]">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-medium">{task.title}</span>
                  <StatusPill>{TASK_STATUS_LABELS_TEAM[task.status]}</StatusPill>
                </div>
                <span className="mt-1 block text-[var(--mute)]">
                  {task.properties?.name ?? "Unknown property"} ·{" "}
                  {formatDate(task.updated_at)}
                </span>
              </Link>
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterLink({
  current,
  value,
  label,
}: {
  current?: TaskStatus;
  value?: TaskStatus;
  label: string;
}) {
  const active = current === value;
  return (
    <Link
      href={value ? `/admin/tasks?status=${value}` : "/admin/tasks"}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-[44px] items-center rounded-[var(--r-md)] border px-4 ${
        active
          ? "border-[var(--ink)] font-medium"
          : "border-[var(--line)] text-[var(--ink-soft)]"
      }`}
    >
      {label}
    </Link>
  );
}
