import { notFound } from "next/navigation";
import Link from "next/link";
import { getProperty } from "@/features/properties/queries";
import { listDocuments } from "@/features/documents/queries";
import { listTasksForProperty } from "@/features/tasks/queries";
import { DocumentList } from "@/features/documents/components/document-list";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS } from "@/lib/constants";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // RLS returns nothing for a property that is not theirs, which renders as not found.
  // Ownership is never checked here. Principle IV.
  const property = await getProperty(id);
  if (!property) notFound();

  const [documents, tasks] = await Promise.all([
    listDocuments(id),
    listTasksForProperty(id),
  ]);

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">{property.name}</h1>
      <p className="mt-1 text-[var(--mute)]">
        {[property.community, property.address].filter(Boolean).join(" · ")}
      </p>

      <h2 className="mt-8 text-[length:var(--text-heading)]">Documents</h2>
      <DocumentList documents={documents} propertyId={id} />

      {tasks.length > 0 ? (
        <>
          <h2 className="mt-8 text-[length:var(--text-heading)]">Recent tasks</h2>
          <ul className="mt-4 space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <Card as="li" key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between gap-3 p-4 min-h-[44px]"
                >
                  <span>{task.title}</span>
                  <StatusPill>{TASK_STATUS_LABELS[task.status]}</StatusPill>
                </Link>
              </Card>
            ))}
          </ul>
        </>
      ) : null}

    </>
  );
}
