import Link from "next/link";
import { listAllTasks } from "@/features/tasks/queries";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS_TEAM,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Request queue" };

export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { status, priority } = await searchParams;
  const filter = TASK_STATUSES.includes(status as TaskStatus)
    ? (status as TaskStatus)
    : undefined;
  const priorityFilter = TASK_PRIORITIES.includes(priority as TaskPriority)
    ? (priority as TaskPriority)
    : undefined;

  const all = await listAllTasks(filter);
  const tasks = priorityFilter ? all.filter((t) => t.priority === priorityFilter) : all;

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">Request queue</h1>

      <nav aria-label="Filter by status" className="mt-4 flex flex-wrap gap-2">
        <FilterLink
          href={hrefFor(undefined, priorityFilter)}
          active={!filter}
          label="All"
        />
        {TASK_STATUSES.map((value) => (
          <FilterLink
            key={value}
            href={hrefFor(value, priorityFilter)}
            active={filter === value}
            label={TASK_STATUS_LABELS_TEAM[value]}
          />
        ))}
      </nav>
      <nav aria-label="Filter by priority" className="mt-2 flex flex-wrap gap-2">
        <FilterLink href={hrefFor(filter, undefined)} active={!priorityFilter} label="Any priority" />
        {TASK_PRIORITIES.map((value) => (
          <FilterLink
            key={value}
            href={hrefFor(filter, value)}
            active={priorityFilter === value}
            label={TASK_PRIORITY_LABELS[value]}
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
                  <span className="flex shrink-0 gap-1.5">
                    <PriorityPill priority={task.priority} />
                    <StatusPill>{TASK_STATUS_LABELS_TEAM[task.status]}</StatusPill>
                  </span>
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

function hrefFor(status?: TaskStatus, priority?: TaskPriority): string {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (priority) params.set("priority", priority);
  const query = params.toString();
  return query ? `/admin/tasks?${query}` : "/admin/tasks";
}

function FilterLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`inline-flex min-h-[40px] items-center rounded-[var(--r-md)] border px-3 text-[length:var(--text-small)] ${
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-white font-medium"
          : "border-[var(--line)] text-[var(--ink-soft)] hover:bg-[var(--surface-2)]"
      }`}
    >
      {label}
    </Link>
  );
}
