import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { getTask, listRequestAttachments, listTaskHistory } from "@/features/tasks/queries";
import { getMyActivity } from "@/features/tasks/activity";
import { TaskThread } from "@/features/tasks/components/task-thread";
import { LiveThread } from "@/features/tasks/components/live-thread";
import { AttachmentGrid } from "@/features/tasks/components/attachment-grid";
import { StatusControl } from "@/features/tasks/components/status-control";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
import { statusTone } from "@/features/tasks/status-tone";
import { ScreenBar } from "@/components/shell/screen-bar";
import { PhoneCollapsible } from "@/components/ui/collapsible";
import { StatusPill } from "@/components/ui/status-pill";
import { createClient } from "@/lib/supabase/server";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS_TEAM } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await getTask(id);
  return { title: task?.title ?? "Request" };
}

/**
 * The team's view of a request. On a phone it is a full-screen conversation like the
 * client's, with the status control and the client's contact details kept in reach.
 */
export default async function AdminTaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTask(id);
  if (!task) notFound();

  const supabase = await createClient();
  const [history, requestFiles, activity, { data: home }] = await Promise.all([
    listTaskHistory(id),
    listRequestAttachments(id),
    getMyActivity(),
    supabase.from("properties").select("name, community, profiles(full_name, phone)").eq("id", task.property_id).maybeSingle(),
  ]);
  const client = (home as unknown as { profiles: { full_name: string | null; phone: string | null } | null } | null)?.profiles;
  const digits = client?.phone?.replace(/[^\d]/g, "") ?? "";
  const wa = digits ? `https://wa.me/${digits.startsWith("0") ? `971${digits.slice(1)}` : digits}` : null;
  const status = TASK_STATUS_LABELS_TEAM[task.status];
  const hadUnread = (activity.get(id)?.unread ?? 0) > 0;

  const facts: Array<[string, string]> = [
    ["Client", client?.full_name ?? ""],
    ["Home", [task.properties?.name, (home as { community?: string } | null)?.community].filter(Boolean).join(", ")],
    ["Sent", formatDate(task.created_at)],
    ["Urgency", TASK_PRIORITY_LABELS[task.priority]],
  ];

  return (
    <div key={id}>
      <LiveThread taskId={id} hadUnread={hadUnread} />
      <ScreenBar
        backHref="/admin/tasks"
        backLabel="All requests"
        title={task.title}
        subtitle={[client?.full_name, status].filter(Boolean).join(", ")}
      />

      <header className="mb-5 hidden md:block">
        <h1 className="text-[length:var(--text-title)]">{task.title}</h1>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusPill tone={statusTone(task.status)}>{status}</StatusPill>
          <PriorityPill priority={task.priority} />
          <span className="text-[var(--mute)]">{task.properties?.name}</span>
        </div>
      </header>

      <section className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3 md:mb-5 md:rounded-[var(--r-lg)] md:border md:px-5 md:py-4">
        <StatusControl taskId={id} status={task.status} priority={task.priority} title={task.title} />
        {wa || client?.phone ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--r-full)] bg-[var(--accent)] px-3.5 text-[length:var(--text-small)] font-semibold text-white">
                <MessageCircle aria-hidden size={16} /> WhatsApp {client?.full_name?.split(" ")[0] ?? "client"}
              </a>
            ) : null}
            {client?.phone ? (
              <a href={`tel:${client.phone}`} className="inline-flex min-h-[40px] items-center gap-1.5 rounded-[var(--r-full)] border border-[var(--line-strong)] px-3.5 text-[length:var(--text-small)] font-semibold">
                <Phone aria-hidden size={16} /> Call
              </a>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="border-b border-[var(--line)] bg-[var(--surface)] px-4 md:mb-5 md:rounded-[var(--r-lg)] md:border md:px-5 md:py-4">
        <h2 className="hidden text-[length:var(--text-heading)] md:mb-3 md:block">Details</h2>
        <PhoneCollapsible summary={<span className="text-[length:var(--text-small)] font-medium text-[var(--ink-soft)]">Details and photos</span>}>
          {task.body ? <p className="whitespace-pre-line">{task.body}</p> : <p className="text-[var(--mute)]">No extra details were added.</p>}
          {requestFiles.length ? <AttachmentGrid items={requestFiles} /> : null}
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
        <h2 className="mb-4 text-[length:var(--text-heading)]">Conversation</h2>
        <TaskThread
          taskId={id}
          entries={history}
          audience="team"
          authorName="Dar team"
          variant="timeline"
          propertyId={task.property_id}
        />
      </section>
    </div>
  );
}
