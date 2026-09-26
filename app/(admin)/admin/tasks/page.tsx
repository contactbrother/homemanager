import Link from "next/link";
import { listAllTasks } from "@/features/tasks/queries";
import { getMyActivity } from "@/features/tasks/activity";
import { RequestRow } from "@/features/tasks/components/request-row";
import { Panel, PanelEmpty, PanelList } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import {
  OPEN_TASK_STATUSES,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS_TEAM,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/constants";

export const metadata = { title: "Requests" };

type Show = "open" | "all" | TaskStatus;

/**
 * The team's queue. Open requests by default; anything with a new client message is
 * pulled to the top, then emergencies and high priority, then the most recent.
 */
export default async function AdminTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string; priority?: string }>;
}) {
  const { show: rawShow, priority } = await searchParams;
  const show: Show =
    rawShow === "all" || TASK_STATUSES.includes(rawShow as TaskStatus) ? (rawShow as Show) : "open";
  const priorityFilter = TASK_PRIORITIES.includes(priority as TaskPriority) ? (priority as TaskPriority) : undefined;

  const [all, activity] = await Promise.all([listAllTasks(), getMyActivity()]);
  const inView = all
    .filter((t) => (show === "open" ? OPEN_TASK_STATUSES.includes(t.status) : show === "all" ? true : t.status === show))
    .filter((t) => (priorityFilter ? t.priority === priorityFilter : true));
  const tasks = [...inView].sort(
    (a, b) => Number((activity.get(b.id)?.unread ?? 0) > 0) - Number((activity.get(a.id)?.unread ?? 0) > 0),
  );
  const openCount = all.filter((t) => OPEN_TASK_STATUSES.includes(t.status)).length;

  const statusChips: Array<[Show, string]> = [
    ["open", `Open ${openCount}`],
    ...TASK_STATUSES.map((s): [Show, string] => [s, TASK_STATUS_LABELS_TEAM[s]]),
    ["all", "All"],
  ];

  return (
    <>
      <PageHeader title="Requests" subtitle="New client messages are pulled to the top." />

      <Chips label="Status" items={statusChips.map(([value, text]) => ({ text, href: hrefFor(value, priorityFilter), active: show === value }))} />
      <div className="mt-2" />
      <Chips
        label="Priority"
        items={[
          { text: "Any priority", href: hrefFor(show, undefined), active: !priorityFilter },
          ...TASK_PRIORITIES.map((p) => ({ text: TASK_PRIORITY_LABELS[p], href: hrefFor(show, p), active: priorityFilter === p })),
        ]}
      />

      <Panel as="div" className="mt-5">
        {tasks.length === 0 ? (
          <PanelEmpty>Nothing in this view.</PanelEmpty>
        ) : (
          <PanelList>
            {tasks.map((task) => (
              <RequestRow
                key={task.id}
                task={task}
                showProperty
                href={`/admin/tasks/${task.id}`}
                statusLabels={TASK_STATUS_LABELS_TEAM}
                unread={activity.get(task.id)?.unread}
                lastActivity={activity.get(task.id)?.lastMessageAt}
              />
            ))}
          </PanelList>
        )}
      </Panel>
    </>
  );
}

function hrefFor(show: Show, priority?: TaskPriority): string {
  const params = new URLSearchParams();
  if (show !== "open") params.set("show", show);
  if (priority) params.set("priority", priority);
  const query = params.toString();
  return query ? `/admin/tasks?${query}` : "/admin/tasks";
}

function Chips({ label, items }: { label: string; items: Array<{ text: string; href: string; active: boolean }> }) {
  return (
    <nav aria-label={label} className="-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
      <ul className="flex min-w-max gap-2">
        {items.map((item) => (
          <li key={item.href + item.text}>
            <Link
              href={item.href}
              replace
              scroll={false}
              aria-current={item.active ? "page" : undefined}
              className={`inline-flex min-h-[40px] items-center rounded-[var(--r-full)] px-3.5 text-[length:var(--text-small)] font-semibold transition-colors ${
                item.active ? "bg-[var(--accent)] text-white" : "border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
