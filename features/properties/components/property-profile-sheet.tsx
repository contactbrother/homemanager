"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyProfile } from "@/features/properties/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import type { Property } from "@/lib/supabase/types";

const field = "w-full min-h-[44px] px-4";

export function PropertyProfileSheet({ property }: { property: Property }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const read = (key: string) => String(form.get(key) ?? "");
    setError(null);
    start(async () => {
      const result = await updatePropertyProfile({
        id: property.id,
        ownerId: property.owner_id,
        name: read("name"),
        community: read("community"),
        address: read("address"),
        villaNumber: read("villaNumber"),
        bedrooms: read("bedrooms"),
        accessNotes: read("accessNotes"),
        keyHolders: read("keyHolders"),
        emergencyContacts: read("emergencyContacts"),
      });
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
      <Button variant="text" onClick={() => setOpen(true)}>
        Edit details
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Home details">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-2">
              Name
            </label>
            <input id="name" name="name" required defaultValue={property.name} className={field} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="community" className="block mb-2">
                Community
              </label>
              <input id="community" name="community" defaultValue={property.community ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="villaNumber" className="block mb-2">
                Villa number
              </label>
              <input id="villaNumber" name="villaNumber" defaultValue={property.villa_number ?? ""} className={field} />
            </div>
            <div className="col-span-2">
              <label htmlFor="address" className="block mb-2">
                Address
              </label>
              <input id="address" name="address" defaultValue={property.address ?? ""} className={field} />
            </div>
            <div>
              <label htmlFor="bedrooms" className="block mb-2">
                Bedrooms
              </label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                defaultValue={property.bedrooms ?? ""}
                className={field}
              />
            </div>
          </div>
          <div>
            <label htmlFor="accessNotes" className="block mb-2">
              Access <span className="text-[var(--mute)]">Gate, security, alarm, parking</span>
            </label>
            <textarea id="accessNotes" name="accessNotes" rows={2} defaultValue={property.access_notes ?? ""} className="w-full px-4 py-3" />
          </div>
          <div>
            <label htmlFor="keyHolders" className="block mb-2">
              Key holders
            </label>
            <textarea id="keyHolders" name="keyHolders" rows={2} defaultValue={property.key_holders ?? ""} className="w-full px-4 py-3" />
          </div>
          <div>
            <label htmlFor="emergencyContacts" className="block mb-2">
              Emergency contacts
            </label>
            <textarea id="emergencyContacts" name="emergencyContacts" rows={2} defaultValue={property.emergency_contacts ?? ""} className="w-full px-4 py-3" />
          </div>

          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}

          <Button type="submit" thumb disabled={pending}>
            {pending ? "Saving" : "Save"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
