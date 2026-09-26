import { requireClient } from "@/features/auth/guards";
import { listRenewals } from "@/features/renewals/queries";
import { listTasks } from "@/features/tasks/queries";
import { listProperties } from "@/features/properties/queries";
import { RenewalRows } from "@/features/renewals/components/renewal-rows";
import { RequestRow } from "@/features/tasks/components/request-row";
import { LatestUpdates } from "@/features/tasks/components/latest-updates";
import { getMyActivity, listLatestUpdates } from "@/features/tasks/activity";
import Link from "next/link";
import { Panel, PanelEmpty, PanelList } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { EXPIRY_WARNING_DAYS, OPEN_TASK_STATUSES } from "@/lib/constants";

export const metadata = { title: "Home" };

/**
 * FR-031 to FR-034. The home screen answers three questions: is anything waiting on
 * me, what is coming up, and what is Dar handling. Three panels side by side on a
 * desktop, two columns on a tablet, stacked on a phone. A panel with nothing in it
 * says so, so the layout never shifts and nothing looks missing.
 */
export default async function HomePage() {
  const profile = await requireClient();
  const [renewals, tasks, properties, updates, activity] = await Promise.all([
    listRenewals({ withinDays: EXPIRY_WARNING_DAYS }),
    listTasks(),
    listProperties(),
    listLatestUpdates(profile.id, 4),
    getMyActivity(),
  ]);

  const waiting = tasks.filter((t) => t.status === "waiting_on_client");
  const handling = tasks.filter(
    (t) => OPEN_TASK_STATUSES.includes(t.status) && t.status !== "waiting_on_client",
  );
  const many = properties.length > 1;
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <>
      <PageHeader
        title={firstName ? `Hello, ${firstName}` : "Hello"}
        subtitle={summary(waiting.length, renewals.length)}
      />

      <div className="mb-4 md:mb-5">
        <LatestUpdates updates={updates} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:items-start">
        <div className="grid gap-4 md:gap-5 lg:contents">
          <Panel title="Waiting on you" count={waiting.length} className="settle">
            {waiting.length > 0 ? (
              <PanelList>
                {waiting.slice(0, SHOW).map((task) => (
                  <RequestRow key={task.id} task={task} showProperty={many} unread={activity.get(task.id)?.unread} lastActivity={activity.get(task.id)?.lastMessageAt} />
                ))}
              </PanelList>
            ) : (
              <PanelEmpty>Nothing needs a reply from you.</PanelEmpty>
            )}
            <SeeAll count={waiting.length} href="/tasks" />
          </Panel>

          <Panel title={`Next ${EXPIRY_WARNING_DAYS} days`} count={renewals.length} className="settle">
            {renewals.length > 0 ? (
              <RenewalRows items={renewals.slice(0, SHOW)} showProperty={many} />
            ) : (
              <PanelEmpty>No renewals or services due in the next {EXPIRY_WARNING_DAYS} days.</PanelEmpty>
            )}
            <SeeAll count={renewals.length} href={properties.length === 1 ? `/properties/${properties[0].id}` : "/properties"} />
          </Panel>
        </div>

        <Panel title="Dar is handling" count={handling.length} className="settle">
          {handling.length > 0 ? (
            <PanelList>
              {handling.slice(0, SHOW).map((task) => (
                <RequestRow key={task.id} task={task} showProperty={many} unread={activity.get(task.id)?.unread} lastActivity={activity.get(task.id)?.lastMessageAt} />
              ))}
            </PanelList>
          ) : (
            <PanelEmpty>Nothing in progress. Anything you send us appears here while we work on it.</PanelEmpty>
          )}
          <SeeAll count={handling.length} href="/tasks" />
        </Panel>
      </div>
    </>
  );
}

const SHOW = 3;

/** Shown only when a panel holds more than it displays. */
function SeeAll({ count, href }: { count: number; href: string }) {
  if (count <= SHOW) return null;
  return (
    <Link href={href} className="flex min-h-[48px] items-center justify-center border-t border-[var(--line)] font-semibold text-[var(--accent-text)] hover:bg-[var(--surface-2)]">
      See all {count}
    </Link>
  );
}

function summary(waiting: number, renewals: number): string {
  if (waiting === 0 && renewals === 0) {
    return `Nothing needs your attention in the next ${EXPIRY_WARNING_DAYS} days.`;
  }
  const parts: string[] = [];
  if (waiting > 0) parts.push(waiting === 1 ? "one request needs a reply" : `${say(waiting)} requests need a reply`);
  if (renewals > 0) parts.push(renewals === 1 ? "one renewal coming up" : `${say(renewals)} renewals coming up`);
  const sentence = parts.join(" and ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/** Numbers up to nine as words, as in running text. */
function say(n: number): string {
  return ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"][n] ?? String(n);
}
