import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getProperty, listProperties } from "@/features/properties/queries";
import { listDocuments } from "@/features/documents/queries";
import { listTasksForProperty } from "@/features/tasks/queries";
import { listAssets } from "@/features/assets/queries";
import { listVendors } from "@/features/vendors/queries";
import { listRenewals } from "@/features/renewals/queries";
import { DocumentList } from "@/features/documents/components/document-list";
import { AssetList } from "@/features/assets/components/asset-list";
import { PropertyOverview } from "@/features/properties/components/property-details";
import { RenewalRows } from "@/features/renewals/components/renewal-rows";
import { RequestRow } from "@/features/tasks/components/request-row";
import { Panel, PanelEmpty, PanelList } from "@/components/ui/panel";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs } from "@/components/ui/tabs";
import { EXPIRY_WARNING_DAYS, OPEN_TASK_STATUSES } from "@/lib/constants";

const TAB_KEYS = ["overview", "documents", "home", "requests"] as const;
type TabKey = (typeof TAB_KEYS)[number];

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await getProperty(id);
  return { title: property?.name ?? "Home file" };
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ id }, { tab }] = await Promise.all([params, searchParams]);
  const active: TabKey = TAB_KEYS.includes(tab as TabKey) ? (tab as TabKey) : "overview";

  // RLS returns nothing for a property that is not theirs, which renders as not found.
  // Ownership is never checked here. Principle IV.
  const property = await getProperty(id);
  if (!property) notFound();

  const [documents, tasks, assets, vendors, renewals, properties] = await Promise.all([
    listDocuments(id),
    listTasksForProperty(id),
    listAssets(id),
    listVendors(),
    listRenewals({ withinDays: EXPIRY_WARNING_DAYS, propertyId: id }),
    listProperties(),
  ]);
  const open = tasks.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
  const base = `/properties/${id}`;

  return (
    <>
      {properties.length > 1 ? (
        <Link
          href="/properties"
          className="-ml-1 mb-2 inline-flex min-h-[44px] items-center gap-1 text-[var(--ink-soft)] hover:text-[var(--ink)]"
        >
          <ChevronLeft aria-hidden size={18} />
          All homes
        </Link>
      ) : null}

      <PageHeader title={property.name} subtitle={property.community ?? undefined}>
        <div className="mt-5">
          <Tabs
            basePath={base}
            active={active}
            items={[
              { key: "overview", label: "Overview" },
              { key: "documents", label: "Documents", count: documents.length },
              { key: "home", label: "In the home", count: assets.length },
              { key: "requests", label: "Requests", count: open.length },
            ]}
          />
        </div>
      </PageHeader>

      <div className="settle" key={active}>
        {active === "overview" ? (
          <div className="grid gap-4 md:gap-5">
            <Panel title={`Coming up in the next ${EXPIRY_WARNING_DAYS} days`} count={renewals.length}>
              {renewals.length > 0 ? (
                <RenewalRows items={renewals} />
              ) : (
                <PanelEmpty>Nothing is due at this home in the next {EXPIRY_WARNING_DAYS} days.</PanelEmpty>
              )}
            </Panel>
            <PropertyOverview property={property} />
          </div>
        ) : null}

        {active === "documents" ? (
          <DocumentList documents={documents} propertyId={id} assets={assets} variant="panel" />
        ) : null}

        {active === "home" ? (
          <AssetList assets={assets} vendors={vendors} propertyId={id} canManage variant="panel" />
        ) : null}

        {active === "requests" ? (
          <Panel title="Requests for this home" count={open.length}>
            {tasks.length > 0 ? (
              <PanelList>
                {tasks.map((task) => (
                  <RequestRow key={task.id} task={task} />
                ))}
              </PanelList>
            ) : (
              <PanelEmpty>No requests for this home yet.</PanelEmpty>
            )}
          </Panel>
        ) : null}
      </div>
    </>
  );
}
