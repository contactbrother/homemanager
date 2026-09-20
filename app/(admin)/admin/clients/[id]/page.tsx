import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient } from "@/features/clients/queries";
import { listPropertiesForOwner } from "@/features/properties/queries";
import { listDocuments } from "@/features/documents/queries";
import { listTasksForProperty } from "@/features/tasks/queries";
import { listAssets } from "@/features/assets/queries";
import { listVendors } from "@/features/vendors/queries";
import { AssetList } from "@/features/assets/components/asset-list";
import { AssetSheet } from "@/features/assets/components/asset-sheet";
import { PropertyDetails } from "@/features/properties/components/property-details";
import { PropertyProfileSheet } from "@/features/properties/components/property-profile-sheet";
import { CreatePropertySheet } from "@/features/clients/components/create-property-sheet";
import { DeactivateControl } from "@/features/clients/components/deactivate-control";
import { DocumentList } from "@/features/documents/components/document-list";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { TASK_STATUS_LABELS_TEAM } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { PriorityPill } from "@/features/tasks/components/priority-pill";

export default async function AdminClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  const [properties, vendors] = await Promise.all([listPropertiesForOwner(id), listVendors()]);
  const sections = await Promise.all(
    properties.map(async (property) => {
      const [documents, tasks, assets] = await Promise.all([
        listDocuments(property.id),
        listTasksForProperty(property.id),
        listAssets(property.id),
      ]);
      return { property, documents, tasks, assets };
    }),
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
          {sections.map(({ property, documents, tasks, assets }) => (
            <section key={property.id} className="rounded-[var(--r-lg)] border border-[var(--line)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-[length:var(--text-heading)]">{property.name}</h2>
                <PropertyProfileSheet property={property} />
              </div>
              <PropertyDetails property={property} showPrivate />

              <h3 className="mt-6 text-[length:var(--text-lead)]">Documents</h3>
              <DocumentList
                documents={documents}
                propertyId={property.id}
                assets={assets}
                canDelete
                uploadVariant="outline"
                uploadLabel="Upload for client"
              />

              <div className="mt-6 flex items-center justify-between gap-3">
                <h3 className="text-[length:var(--text-lead)]">In the home</h3>
                <AssetSheet propertyId={property.id} vendors={vendors} variant="outline" label="Add item" />
              </div>
              <AssetList assets={assets} vendors={vendors} propertyId={property.id} canManage />

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
                        <span className="flex shrink-0 gap-1.5">
                          <PriorityPill priority={task.priority} />
                          <StatusPill>{TASK_STATUS_LABELS_TEAM[task.status]}</StatusPill>
                        </span>
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
