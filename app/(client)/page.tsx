import { requireClient } from "@/features/auth/guards";
import { listRenewals } from "@/features/renewals/queries";
import { listTasks } from "@/features/tasks/queries";
import { listProperties } from "@/features/properties/queries";
import { RenewalRows } from "@/features/renewals/components/renewal-rows";
import { RequestRow } from "@/features/tasks/components/request-row";
import { LatestUpdates } from "@/features/tasks/components/latest-updates";
import { getMyActivity, listLatestUpdates } from "@/features/tasks/activity";
import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Panel, PanelList } from "@/components/ui/panel";
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

  if (properties.length === 0) return <Welcome name={firstName} />;

  // Panels with something in them are shown; empty ones fold into one "all clear" line.
  const panels = [
    waiting.length > 0 ? (
      <Panel key="waiting" title="Waiting on you" count={waiting.length} className="settle">
        <PanelList>
          {waiting.slice(0, SHOW).map((task) => (
            <RequestRow key={task.id} task={task} showProperty={many} unread={activity.get(task.id)?.unread} lastActivity={activity.get(task.id)?.lastMessageAt} />
          ))}
        </PanelList>
        <SeeAll count={waiting.length} href="/tasks" />
      </Panel>
    ) : null,
    renewals.length > 0 ? (
      <Panel key="renewals" title={`Next ${EXPIRY_WARNING_DAYS} days`} count={renewals.length} className="settle">
        <RenewalRows items={renewals.slice(0, SHOW)} showProperty={many} />
        <SeeAll count={renewals.length} href={properties.length === 1 ? `/properties/${properties[0].id}` : "/properties"} />
      </Panel>
    ) : null,
    handling.length > 0 ? (
      <Panel key="handling" title="Dar is handling" count={handling.length} className="settle">
        <PanelList>
          {handling.slice(0, SHOW).map((task) => (
            <RequestRow key={task.id} task={task} showProperty={many} unread={activity.get(task.id)?.unread} lastActivity={activity.get(task.id)?.lastMessageAt} />
          ))}
        </PanelList>
        <SeeAll count={handling.length} href="/tasks" />
      </Panel>
    ) : null,
  ].filter(Boolean);

  const clear = [
    waiting.length === 0 ? "nothing needs a reply from you" : null,
    renewals.length === 0 ? `nothing is due in the next ${EXPIRY_WARNING_DAYS} days` : null,
    handling.length === 0 ? "no requests in progress" : null,
  ].filter(Boolean) as string[];

  const cols = panels.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : panels.length === 2 ? "md:grid-cols-2" : "";

  return (
    <>
      <PageHeader
        title={firstName ? `Hello, ${firstName}` : "Hello"}
        subtitle={summary(waiting.length, renewals.length)}
      />

      {updates.length > 0 ? (
        <div className="mb-4 md:mb-5">
          <LatestUpdates updates={updates} />
        </div>
      ) : null}

      {panels.length > 0 ? <div className={`grid gap-4 md:gap-5 lg:items-start ${cols}`}>{panels}</div> : null}

      {clear.length > 0 ? (
        <p className="mt-4 flex items-start gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-[var(--ink-soft)] md:mt-5 md:px-5">
          <CheckCircle2 aria-hidden size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <span>
            <span className="font-semibold text-[var(--ink)]">All clear: </span>
            {joinWords(clear)}.
          </span>
        </p>
      ) : null}
    </>
  );
}

function joinWords(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** A new account with no home yet: what happens next, and one way to move it along. */
function Welcome({ name }: { name?: string }) {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  const wa = number
    ? `https://wa.me/${number}?text=${encodeURIComponent("Hello Dar, I have just created my account and would like to set up my home.")}`
    : null;
  const steps: Array<[string, string]> = [
    ["We get in touch", "Message us on WhatsApp so we can talk through your home and what you would like handled."],
    ["We set up your home file", "Your documents, the systems in your home and their dates, entered by our team."],
    ["Everything appears here", "What is due, what we are handling, and every request, all on this screen."],
  ];
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title={name ? `Welcome to Dar, ${name}` : "Welcome to Dar"} subtitle="Your account is ready. Here is what happens next." />
      <ol className="space-y-3">
        {steps.map(([title, body], i) => (
          <li key={title} className="flex gap-4 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 md:p-5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-white">{i + 1}</span>
            <span>
              <span className="block font-semibold">{title}</span>
              <span className="mt-1 block text-[var(--ink-soft)]">{body}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap gap-3">
        {wa ? (
          <a href={wa} className="inline-flex min-h-[52px] items-center gap-2 rounded-[var(--r-full)] bg-[var(--accent)] px-6 font-semibold text-white active:scale-[0.98]">
            <MessageCircle aria-hidden size={20} />
            Message us on WhatsApp
          </a>
        ) : null}
        <Link href="/profile" className="inline-flex min-h-[52px] items-center rounded-[var(--r-full)] border border-[var(--line-strong)] bg-[var(--surface)] px-6 font-semibold">
          Add your phone number
        </Link>
      </div>
    </div>
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
