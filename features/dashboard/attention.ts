import { listAllDocuments } from "@/features/documents/queries";
import { listTasks } from "@/features/tasks/queries";
import { expiryLabel } from "@/features/documents/expiry";
import { daysUntil } from "@/lib/format";

export interface AttentionItem {
  id: string;
  kind: "document" | "task";
  title: string;
  detail: string;
  href: string;
  tone: "warn" | "alert" | "quiet";
  /** Lower sorts first. FR-032, soonest first. */
  urgency: number;
}

/**
 * FR-031, FR-032. The home screen answers one question: does anything need me?
 *
 * Documents contribute when they are expiring or expired. Tasks contribute when they
 * are waiting on the client, because that is the only status that asks something of
 * them. A task merely in progress is not an attention item: it is the team's turn, and
 * putting it here would make a calm screen busy for no reason.
 */
export async function getAttentionItems(): Promise<AttentionItem[]> {
  const [documents, tasks] = await Promise.all([listAllDocuments(), listTasks()]);

  const items: AttentionItem[] = [];

  for (const doc of documents) {
    if (doc.status === "none") continue;
    items.push({
      id: `doc-${doc.id}`,
      kind: "document",
      title: doc.title,
      detail: expiryLabel(doc.expires_on) ?? "",
      href: `/properties/${doc.property_id}`,
      tone: doc.status === "expired" ? "alert" : "warn",
      // Expired sorts ahead of expiring, and within each, soonest first.
      urgency: daysUntil(doc.expires_on!),
    });
  }

  for (const task of tasks) {
    if (task.status !== "waiting_on_client") continue;
    items.push({
      id: `task-${task.id}`,
      kind: "task",
      title: task.title,
      detail: "Waiting on you",
      href: `/tasks/${task.id}`,
      tone: "warn",
      // A request already waiting on the client is more urgent than a document
      // expiring in a fortnight, so it sorts ahead of anything not yet overdue.
      urgency: -1,
    });
  }

  return items.sort((a, b) => a.urgency - b.urgency);
}
