import Link from "next/link";
import { requireClient } from "@/features/auth/guards";
import { listRenewals } from "@/features/renewals/queries";
import { listTasks } from "@/features/tasks/queries";
import { listProperties } from "@/features/properties/queries";
import { NewTaskSheet } from "@/features/tasks/components/new-task-sheet";
import { RenewalList } from "@/features/renewals/components/renewal-list";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { EXPIRY_WARNING_DAYS, OPEN_TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/constants";

export const metadata = { title: "Dar" };

/**
 * FR-031 to FR-034, revised. The home screen answers three questions in order:
 * is anything waiting on me, what is coming up in the next 30 days, and what is Dar
 * handling right now. A home with nothing due says so in a sentence.
 */
export default async function HomePage() {
  const profile = await requireClient();
  const [renewals, tasks, properties] = await Promise.all([
    listRenewals({ withinDays: EXPIRY_WARNING_DAYS }),
    listTasks(),
    listProperties(),
  ]);

  const waiting = tasks.filter((t) => t.status === "waiting_on_client");
  const handling = tasks.filter(
    (t) => OPEN_TASK_STATUSES.includes(t.status) && t.status !== "waiting_on_client",
  );
  const firstName = profile.full_name?.split(" ")[0];
  const quiet = waiting.length === 0 && renewals.length === 0;

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">
        {firstName ? `Hello, ${firstName}` : "Hello"}
      </h1>

      {quiet ? (
        <p className="mt-2 text-[var(--ink-soft)]">
          Nothing needs your attention in the next {EXPIRY_WARNING_DAYS} days.
        </p>
      ) : (
        <p className="mt-2 text-[var(--ink-soft)]">
          {summary(waiting.length, renewals.length)}
        </p>
      )}

      {waiting.length > 0 ? (
        <section className="mt-6">
          <h2 className="text-[length:var(--text-heading)]">Waiting on you</h2>
          <TaskCards tasks={waiting} />
        </section>
      ) : null}

      {renewals.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[length:var(--text-heading)]">Next {EXPIRY_WARNING_DAYS} days</h2>
          <RenewalList items={renewals} showProperty={properties.length > 1} linkBase="client" />
        </section>
      ) : null}

      {handling.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[length:var(--text-heading)]">Dar is handling</h2>
          <TaskCards tasks={handling} />
        </section>
      ) : null}

      {/* FR-034. One primary action, reachable without navigating first. */}
      <div className="fixed bottom-[56px] inset-x-0 border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto max-w-md px-5 py-3">
          <NewTaskSheet properties={properties} />
        </div>
      </div>
    </>
  );
}

function summary(waiting: number, renewals: number): string {
  const parts: string[] = [];
  if (waiting > 0) parts.push(waiting === 1 ? "one request needs a reply" : `${waiting} requests need a reply`);
  if (renewals > 0) parts.push(renewals === 1 ? "one renewal coming up" : `${renewals} renewals coming up`);
  const sentence = parts.join(" and ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

function TaskCards({ tasks }: { tasks: Array<{ id: string; title: string; status: keyof typeof TASK_STATUS_LABELS; priority: "low" | "normal" | "high" | "emergency" }> }) {
  return (
    <ul className="mt-4 space-y-3 settle">
      {tasks.map((task) => (
        <Card as="li" key={task.id}>
          <Link href={`/tasks/${task.id}`} className="block p-4 min-h-[44px]">
            <div className="flex items-start justify-between gap-3">
              <span className="font-medium">{task.title}</span>
              <span className="flex shrink-0 gap-1.5">
                <PriorityPill priority={task.priority} />
                <StatusPill tone={task.status === "waiting_on_client" ? "warn" : "quiet"}>
                  {TASK_STATUS_LABELS[task.status]}
                </StatusPill>
              </span>
            </div>
          </Link>
        </Card>
      ))}
    </ul>
  );
}
