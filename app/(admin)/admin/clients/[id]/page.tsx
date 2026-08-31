import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient } from "@/features/clients/queries";
import { listPropertiesForOwner } from "@/features/properties/queries";
import { listDocuments } from "@/features/documents/queries";
import { listTasksForProperty } from "@/features/tasks/queries";
import { CreatePropertySheet } from "@/features/clients/components/create-property-sheet";
import { DeactivateControl } from "@/features/clients/components/deactivate-control";
import { UploadSheet } from "@/features/documents/components/upload-sheet";
import { DocumentRowItem } from "@/features/documents/components/document-row";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS_TEAM } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const properties = await listPropertiesForOwner(id);
  const sections = await Promise.all(
    properties.map(async (property) => ({
      property,
      documents: await listDocuments(property.id),
      tasks: await listTasksForProperty(property.id),
    })),
  );

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--text-title)]">
            {client.full_name ?? "Unnamed client"}
          </h1>
          <p className="mt-1 text-[var(--mute)]">
            {client.phone ?? "No phone recorded"}
            {client.deactivated_at
              ? ` · Deactivated ${formatDate(client.deactivated_at)}`
              : ""}
          </p>
        </div>
        {/* The single primary action. Deactivation below is secondary by design. */}
        <CreatePropertySheet ownerId={id} />
      </div>

      {properties.length === 0 ? (
        <EmptyState>No properties yet.</EmptyState>
      ) : (
        <div className="mt-8 space-y-10">
          {sections.map(({ property, documents, tasks }) => (
            <section key={property.id}>
              <h2 className="text-[length:var(--text-heading)]">{property.name}</h2>
              <p className="text-[var(--mute)]">
                {[property.community, property.address].filter(Boolean).join(" · ") ||
                  "No address recorded"}
              </p>

              <div className="mt-4 flex items-center justify-between gap-4">
                <h3 className="text-[length:var(--text-lead)]">Documents</h3>
                <UploadSheet propertyId={property.id} label="Upload for client" />
              </div>
              {documents.length === 0 ? (
                <EmptyState>No documents yet.</EmptyState>
              ) : (
                <ul className="mt-3 space-y-3">
                  {documents.map((doc) => (
                    <DocumentRowItem key={doc.id} document={doc} canDelete />
                  ))}
                </ul>
              )}

              <h3 className="mt-6 text-[length:var(--text-lead)]">Tasks</h3>
              {tasks.length === 0 ? (
                <EmptyState>No tasks yet.</EmptyState>
              ) : (
                <ul className="mt-3 space-y-3">
                  {tasks.map((task) => (
                    <Card as="li" key={task.id}>
                      <Link
                        href={`/admin/tasks/${task.id}`}
                        className="flex items-center justify-between gap-3 p-4 min-h-[44px]"
                      >
                        <span>{task.title}</span>
                        <StatusPill>{TASK_STATUS_LABELS_TEAM[task.status]}</StatusPill>
                      </Link>
                    </Card>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="mt-12 border-t border-[var(--line)] pt-6">
        <DeactivateControl
          profileId={id}
          deactivatedAt={client.deactivated_at}
          name={client.full_name ?? "this client"}
        />
      </div>
    </>
  );
}
