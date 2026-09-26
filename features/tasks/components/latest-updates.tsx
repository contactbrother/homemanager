import Link from "next/link";
import { Panel, PanelEmpty } from "@/components/ui/panel";
import { TASK_STATUS_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import type { LatestUpdate } from "@/features/tasks/activity";
import { DarMark } from "@/components/brand/dar-mark";

/**
 * The newest messages from the team, like a chat list: who, the request, the first
 * line and when. Unread ones are marked. Tapping opens the full conversation.
 */
export function LatestUpdates({ updates }: { updates: LatestUpdate[] }) {
  const unread = updates.filter((u) => u.unread).length;
  return (
    <Panel
      title="Latest updates"
      count={unread}
      action={
        <Link href="/tasks" className="inline-flex min-h-[44px] items-center font-semibold text-[var(--accent-text)]">
          See all
        </Link>
      }
    >
      {updates.length === 0 ? (
        <PanelEmpty>When the team replies or moves a request forward, it shows here first.</PanelEmpty>
      ) : (
        <ul className="divide-y divide-[var(--line)]">
          {updates.map((u) => {
            const text = u.body ?? (u.statusTo ? `Moved to ${TASK_STATUS_LABELS[u.statusTo]}` : "");
            return (
              <li key={u.id}>
                <Link
                  href={`/tasks/${u.taskId}`}
                  className="flex min-h-[64px] items-start gap-3 px-4 py-3 transition-colors hover:bg-[var(--surface-2)] active:bg-[var(--line)] md:px-5"
                >
                  {u.author === "Dar" ? (
                    <DarMark size={36} className="mt-0.5 shrink-0" />
                  ) : (
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[length:var(--text-small)] font-bold text-[var(--accent-text)]"
                    >
                      {u.author.charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate ${u.unread ? "font-bold" : "font-medium"}`}>{u.taskTitle}</span>
                      <span
                        suppressHydrationWarning
                        className={`shrink-0 text-[length:var(--text-tiny)] ${u.unread ? "font-semibold text-[var(--accent-text)]" : "text-[var(--mute)]"}`}
                      >
                        {formatRelative(u.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center gap-2">
                      <span className={`line-clamp-1 flex-1 text-[length:var(--text-small)] ${u.unread ? "text-[var(--ink)]" : "text-[var(--mute)]"}`}>
                        <span className="font-semibold">{u.author}: </span>
                        {text}
                      </span>
                      {u.unread ? <span aria-label="New" className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" /> : null}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
