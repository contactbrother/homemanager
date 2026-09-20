import { listVendors } from "@/features/vendors/queries";
import { VendorSheet } from "@/features/vendors/components/vendor-sheet";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { VENDOR_CATEGORY_LABELS } from "@/lib/constants";

export const metadata = { title: "Vendors" };

export default async function VendorsPage() {
  const vendors = await listVendors({ includeInactive: true });

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[length:var(--text-title)]">Vendors</h1>
          <p className="mt-1 text-[var(--mute)]">
            Who services what. Assign a vendor to an item in a client's home and it shows on their record.
          </p>
        </div>
        <VendorSheet />
      </div>

      {vendors.length === 0 ? (
        <EmptyState>No vendors yet.</EmptyState>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {vendors.map((vendor) => (
            <Card as="li" key={vendor.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-[length:var(--text-small)] text-[var(--mute)]">
                    {VENDOR_CATEGORY_LABELS[vendor.category]}
                  </p>
                </div>
                {vendor.is_active ? null : <StatusPill tone="quiet">Inactive</StatusPill>}
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[length:var(--text-small)]">
                {vendor.phone ? (
                  <>
                    <dt className="text-[var(--mute)]">Phone</dt>
                    <dd>
                      <a href={`tel:${vendor.phone}`} className="underline">
                        {vendor.phone}
                      </a>
                    </dd>
                  </>
                ) : null}
                {vendor.email ? (
                  <>
                    <dt className="text-[var(--mute)]">Email</dt>
                    <dd className="truncate">{vendor.email}</dd>
                  </>
                ) : null}
                {vendor.rate_notes ? (
                  <>
                    <dt className="text-[var(--mute)]">Rates</dt>
                    <dd>{vendor.rate_notes}</dd>
                  </>
                ) : null}
                {vendor.notes ? (
                  <>
                    <dt className="text-[var(--mute)]">Notes</dt>
                    <dd>{vendor.notes}</dd>
                  </>
                ) : null}
              </dl>
              <div className="mt-3">
                <VendorSheet vendor={vendor} />
              </div>
            </Card>
          ))}
        </ul>
      )}
    </>
  );
}
