import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { ASSET_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Asset, Vendor } from "@/lib/supabase/types";
import { nextServiceOn, serviceState, warrantyState } from "@/features/assets/service";
import { AssetSheet } from "./asset-sheet";
import { LogServiceButton } from "./log-service-button";

/** The register. Each item shows only what is due or expiring; a healthy item is quiet. */
export function AssetList({
  assets,
  vendors,
  propertyId,
  canManage,
}: {
  assets: Asset[];
  vendors: Vendor[];
  propertyId: string;
  canManage: boolean;
}) {
  const vendorName = (id: string | null) => vendors.find((v) => v.id === id)?.name ?? null;

  return (
    <>
      {assets.length === 0 ? (
        <EmptyState>
          Nothing recorded yet. Add the AC units, water heater, pool and anything else
          that needs looking after.
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {assets.map((asset) => {
            const service = serviceState(asset);
            const warranty = warrantyState(asset);
            const next = nextServiceOn(asset);
            const vendor = vendorName(asset.vendor_id);
            return (
              <Card as="li" key={asset.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{asset.name}</p>
                    <p className="text-[var(--mute)] text-[length:var(--text-small)]">
                      {[
                        ASSET_CATEGORY_LABELS[asset.category],
                        [asset.brand, asset.model].filter(Boolean).join(" "),
                        asset.location,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    {service === "overdue" ? (
                      <StatusPill tone="alert">Service overdue</StatusPill>
                    ) : service === "due_soon" ? (
                      <StatusPill tone="warn">Service due</StatusPill>
                    ) : null}
                    {warranty === "overdue" ? (
                      <StatusPill tone="quiet">Out of warranty</StatusPill>
                    ) : warranty === "due_soon" ? (
                      <StatusPill tone="warn">Warranty ending</StatusPill>
                    ) : null}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[length:var(--text-small)]">
                  {next ? (
                    <>
                      <dt className="text-[var(--mute)]">Next service</dt>
                      <dd>{formatDate(next)}</dd>
                    </>
                  ) : null}
                  {asset.last_serviced_on ? (
                    <>
                      <dt className="text-[var(--mute)]">Last serviced</dt>
                      <dd>{formatDate(asset.last_serviced_on)}</dd>
                    </>
                  ) : null}
                  {asset.warranty_until ? (
                    <>
                      <dt className="text-[var(--mute)]">Warranty until</dt>
                      <dd>{formatDate(asset.warranty_until)}</dd>
                    </>
                  ) : null}
                  {vendor ? (
                    <>
                      <dt className="text-[var(--mute)]">Serviced by</dt>
                      <dd>{vendor}</dd>
                    </>
                  ) : null}
                </dl>

                {canManage ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AssetSheet propertyId={propertyId} vendors={vendors} asset={asset} variant="text" />
                    {asset.service_interval_months ? (
                      <LogServiceButton assetId={asset.id} propertyId={propertyId} />
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </ul>
      )}
    </>
  );
}
