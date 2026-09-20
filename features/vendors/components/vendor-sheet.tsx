"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createVendor, updateVendor, type VendorInput } from "@/features/vendors/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/constants";
import type { Vendor } from "@/lib/supabase/types";

const field = "w-full min-h-[44px] px-4";

export function VendorSheet({ vendor }: { vendor?: Vendor }) {
  const editing = Boolean(vendor);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "");
    const input: VendorInput = {
      name: read("name"),
      category: read("category") as VendorCategory,
      phone: read("phone"),
      email: read("email"),
      rateNotes: read("rateNotes"),
      notes: read("notes"),
      isActive: form.get("isActive") === "on",
    };

    setError(null);
    start(async () => {
      const result = vendor ? await updateVendor(vendor.id, input) : await createVendor(input);
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
      <Button variant={editing ? "text" : "primary"} onClick={() => setOpen(true)}>
        {editing ? "Edit" : "Add a vendor"}
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? "Edit vendor" : "Add a vendor"}>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2">
              Company or person
            </label>
            <input id="name" name="name" required defaultValue={vendor?.name ?? ""} className={field} />
          </div>
          <div>
            <label htmlFor="category" className="block mb-2">
              What they do
            </label>
            <select id="category" name="category" defaultValue={vendor?.category ?? "general"} className={field}>
              {VENDOR_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {VENDOR_CATEGORY_LABELS[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="phone" className="block mb-2">
                Phone
              </label>
              <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={vendor?.phone ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input id="email" name="email" type="email" defaultValue={vendor?.email ?? ""} className={field} />
            </div>
          </div>
          <div>
            <label htmlFor="rateNotes" className="block mb-2">
              Rates <span className="text-[var(--mute)]">Optional</span>
            </label>
            <input
              id="rateNotes"
              name="rateNotes"
              placeholder="AED 150 per AC unit, AED 350 call-out"
              defaultValue={vendor?.rate_notes ?? ""}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="notes" className="block mb-2">
              Notes <span className="text-[var(--mute)]">Optional</span>
            </label>
            <textarea id="notes" name="notes" rows={2} defaultValue={vendor?.notes ?? ""} className="w-full px-4 py-3" />
          </div>
          <label className="flex min-h-[44px] items-center gap-3">
            <input type="checkbox" name="isActive" defaultChecked={vendor?.is_active ?? true} className="h-5 w-5" />
            Active, available to assign
          </label>

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Saving" : editing ? "Save changes" : "Add vendor"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
