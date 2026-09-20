import { notFound } from "next/navigation";
import Link from "next/link";
import { getProperty } from "@/features/properties/queries";
import { listDocuments } from "@/features/documents/queries";
import { listTasksForProperty } from "@/features/tasks/queries";
import { listAssets } from "@/features/assets/queries";
import { listVendors } from "@/features/vendors/queries";
import { DocumentList } from "@/features/documents/components/document-list";
import { AssetList } from "@/features/assets/components/asset-list";
import { AssetSheet } from "@/features/assets/components/asset-sheet";
import { PropertyDetails } from "@/features/properties/components/property-details";
import { PriorityPill } from "@/features/tasks/components/priority-pill";
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

  const [documents, tasks, assets, vendors] = await Promise.all([
    listDocuments(id),
    listTasksForProperty(id),
    listAssets(id),
    listVendors(),
  ]);

  return (
    <>
      <h1 className="text-[length:var(--text-title)]">{property.name}</h1>
      <PropertyDetails property={property} showPrivate />

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[length:var(--text-heading)]">Documents</h2>
        </div>
        <DocumentList documents={documents} propertyId={id} uploadVariant="outline" />
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[length:var(--text-heading)]">In the home</h2>
          <AssetSheet propertyId={id} vendors={vendors} variant="outline" label="Add" />
        </div>
        <AssetList assets={assets} vendors={vendors} propertyId={id} canManage />
      </section>

      {tasks.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[length:var(--text-heading)]">Recent requests</h2>
          <ul className="mt-4 space-y-3">
            {tasks.slice(0, 3).map((task) => (
              <Card as="li" key={task.id}>
                <Link
                  href={`/tasks/${task.id}`}
                  className="flex items-center justify-between gap-3 p-4 min-h-[44px]"
                >
                  <span>{task.title}</span>
                  <span className="flex shrink-0 gap-1.5">
                    <PriorityPill priority={task.priority} />
                    <StatusPill>{TASK_STATUS_LABELS[task.status]}</StatusPill>
                  </span>
                </Link>
              </Card>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
