"use client";

import { useState, useTransition } from "react";
import { createProperty } from "@/features/properties/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function CreatePropertySheet({ ownerId }: { ownerId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(null);
    start(async () => {
      const result = await createProperty({
        ownerId,
        name: String(form.get("name") ?? ""),
        community: String(form.get("community") ?? ""),
        address: String(form.get("address") ?? ""),
        photo: form.get("photo") as File | null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create property</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Create property">
        <form onSubmit={submit} className="space-y-4">
          <Field name="name" label="Name" required />
          <Field name="community" label="Community" />
          <Field name="address" label="Address" />
          <div>
            <label htmlFor="photo" className="block mb-2">
              Photo
            </label>
            <input
              id="photo"
              name="photo"
              type="file"
              accept="image/*"
              className="w-full min-h-[44px]"
            />
          </div>
          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" thumb disabled={pending}>
            {pending ? "Creating" : "Create property"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}

function Field({
  name,
  label,
  required,
}: {
  name: string;
  label: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)]"
      />
    </div>
  );
}
