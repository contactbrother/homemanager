"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Panel, PanelEmpty, PanelList } from "@/components/ui/panel";
import { OPEN_TASK_STATUSES } from "@/lib/constants";
import { RequestRow } from "./request-row";
import type { TaskWithProperty } from "@/features/tasks/types";
import type { TaskActivity } from "@/features/tasks/activity";

/**
 * Requests as list and detail. Desktop shows both side by side, with the open request
 * marked in the list. Phones and tablets show one at a time: the list on /tasks, the
 * request on /tasks/[id].
 */
export function RequestsSplit({
  tasks,
  showProperty,
  activity,
  children,
}: {
  tasks: TaskWithProperty[];
  showProperty: boolean;
  activity: Record<string, TaskActivity>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const selectedId = pathname.startsWith("/tasks/") ? pathname.split("/")[2] : null;
  const isIndex = !selectedId;

  // Requests with news float to the top, like a messaging app; the server's order
  // (priority, then recency) is kept otherwise.
  const withNewsFirst = (list: TaskWithProperty[]) =>
    [...list].sort((a, b) => Number((activity[b.id]?.unread ?? 0) > 0) - Number((activity[a.id]?.unread ?? 0) > 0));
  const open = withNewsFirst(tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status)));
  const closed = withNewsFirst(tasks.filter((t) => !OPEN_TASK_STATUSES.includes(t.status)));
  const selectedIsClosed = closed.some((t) => t.id === selectedId);
  const [show, setShow] = useState<"open" | "closed">(selectedIsClosed ? "closed" : "open");
  const visible = show === "open" ? open : closed;
  const Heading = isIndex ? "h1" : "h2";

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start lg:gap-6">
      <div className={isIndex ? "" : "hidden lg:block lg:sticky lg:top-10"}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <Heading className="text-[length:var(--text-title)]">Requests</Heading>
          <div role="group" aria-label="Show" className="inline-flex rounded-[var(--r-full)] border border-[var(--line)] bg-[var(--surface)] p-1">
            {(
              [
                ["open", `Open ${open.length}`],
                ["closed", `Closed ${closed.length}`],
              ] as const
            ).map(([key, text]) => (
              <button
                key={key}
                type="button"
                aria-pressed={show === key}
                onClick={() => setShow(key)}
                className={`min-h-[36px] rounded-[var(--r-full)] px-3.5 text-[length:var(--text-small)] font-semibold transition-colors duration-[var(--fast)] ${
                  show === key ? "bg-[var(--accent)] text-white" : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                }`}
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <Panel as="div">
          {visible.length > 0 ? (
            <PanelList>
              {visible.map((task) => (
                <RequestRow
                  key={task.id}
                  task={task}
                  showProperty={showProperty}
                  current={task.id === selectedId}
                  unread={task.id === selectedId ? 0 : (activity[task.id]?.unread ?? 0)}
                  lastActivity={activity[task.id]?.lastMessageAt}
                />
              ))}
            </PanelList>
          ) : (
            <PanelEmpty>
              {show === "open"
                ? "Nothing open. Use New request to send us anything that needs doing at home."
                : "Finished and cancelled requests will appear here."}
            </PanelEmpty>
          )}
        </Panel>
      </div>

      <div className={isIndex ? "hidden lg:block" : ""}>{children}</div>
    </div>
  );
}
