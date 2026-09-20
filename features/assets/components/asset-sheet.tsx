"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAsset, updateAsset, type AssetInput } from "@/features/assets/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import {
  ASSET_CATEGORIES,
  ASSET_CATEGORY_LABELS,
  VENDOR_CATEGORY_LABELS,
  type AssetCategory,
} from "@/lib/constants";
import type { Asset, Vendor } from "@/lib/supabase/types";

const field = "w-full min-h-[44px] px-4";

/** Add or edit one item in the home. The same sheet serves both so the fields never
 *  drift apart. Vendors are only offered where the team has recorded some. */
export function AssetSheet({
  propertyId,
  vendors,
  asset,
  label,
  variant = "outline",
}: {
  propertyId: string;
  vendors: Vendor[];
  asset?: Asset;
  label?: string;
  variant?: "primary" | "outline" | "text";
}) {
  const editing = Boolean(asset);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "");
    const input: AssetInput = {
      propertyId,
      category: read("category") as AssetCategory,
      name: read("name"),
      brand: read("brand"),
      model: read("model"),
      serialNo: read("serialNo"),
      location: read("location"),
      installedOn: read("installedOn"),
      warrantyUntil: read("warrantyUntil"),
      serviceIntervalMonths: read("serviceIntervalMonths"),
      lastServicedOn: read("lastServicedOn"),
      vendorId: read("vendorId"),
      notes: read("notes"),
    };

    setError(null);
    start(async () => {
      const result = asset ? await updateAsset(asset.id, input) : await createAsset(input);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        {label ?? (editing ? "Edit" : "Add an item")}
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit item" : "Add an item to the home"}
      >
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label htmlFor="category" className="block mb-2">
                What kind of item
              </label>
              <select
                id="category"
                name="category"
                defaultValue={asset?.category ?? "ac"}
                className={field}
              >
                {ASSET_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {ASSET_CATEGORY_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label htmlFor="name" className="block mb-2">
                Name
              </label>
              <input
                id="name"
                name="name"
                required
                maxLength={80}
                placeholder="Master bedroom AC"
                defaultValue={asset?.name ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="brand" className="block mb-2">
                Brand
              </label>
              <input id="brand" name="brand" defaultValue={asset?.brand ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="model" className="block mb-2">
                Model
              </label>
              <input id="model" name="model" defaultValue={asset?.model ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="serialNo" className="block mb-2">
                Serial number
              </label>
              <input
                id="serialNo"
                name="serialNo"
                defaultValue={asset?.serial_no ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="location" className="block mb-2">
                Where in the home
              </label>
              <input
                id="location"
                name="location"
                placeholder="Roof, first floor"
                defaultValue={asset?.location ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="installedOn" className="block mb-2">
                Installed on
              </label>
              <input
                id="installedOn"
                name="installedOn"
                type="date"
                defaultValue={asset?.installed_on ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="warrantyUntil" className="block mb-2">
                Warranty until
              </label>
              <input
                id="warrantyUntil"
                name="warrantyUntil"
                type="date"
                defaultValue={asset?.warranty_until ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="serviceIntervalMonths" className="block mb-2">
                Service every (months)
              </label>
              <input
                id="serviceIntervalMonths"
                name="serviceIntervalMonths"
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                placeholder="6"
                defaultValue={asset?.service_interval_months ?? ""}
                className={field}
              />
            </div>
            <div>
              <label htmlFor="lastServicedOn" className="block mb-2">
                Last serviced
              </label>
              <input
                id="lastServicedOn"
                name="lastServicedOn"
                type="date"
                defaultValue={asset?.last_serviced_on ?? ""}
                className={field}
              />
            </div>
            {vendors.length > 0 ? (
              <div className="col-span-2">
                <label htmlFor="vendorId" className="block mb-2">
                  Serviced by
                </label>
                <select
                  id="vendorId"
                  name="vendorId"
                  defaultValue={asset?.vendor_id ?? ""}
                  className={field}
                >
                  <option value="">Not set</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} · {VENDOR_CATEGORY_LABELS[vendor.category]}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className="col-span-2">
              <label htmlFor="notes" className="block mb-2">
                Notes <span className="text-[var(--mute)]">Optional</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                defaultValue={asset?.notes ?? ""}
                className="w-full px-4 py-3"
              />
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Saving" : editing ? "Save changes" : "Add item"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
