"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function ProfileForm({
  fullName: initialName,
  phone: initialPhone,
}: {
  fullName: string;
  phone: string;
}) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    start(async () => {
      const result = await updateProfile({ fullName, phone });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Saved.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block mb-2">
          Name
        </label>
        <input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
        />
      </div>
      <div>
        <label htmlFor="phone" className="block mb-2">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
        />
      </div>
      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}
      <p aria-live="polite" className="text-[var(--ok)]">
        {message ?? " "}
      </p>
      <Button type="submit" thumb disabled={pending}>
        {pending ? "Saving" : "Save"}
      </Button>
    </form>
  );
}
