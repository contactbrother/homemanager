"use client";

import { useState, useTransition } from "react";
import { createClientAccount } from "@/features/clients/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

export function CreateClientSheet() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await createClientAccount({ email, fullName });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setEmail("");
      setFullName("");
    });
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Create client</Button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Create client">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="client-name" className="block mb-2">
              Full name
            </label>
            <input
              id="client-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)]"
            />
          </div>
          <div>
            <label htmlFor="client-email" className="block mb-2">
              Email
            </label>
            <input
              id="client-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)]"
            />
            <p className="mt-2 text-[var(--mute)]">
              They receive a sign-in link straight away. Only registered addresses can
              sign in.
            </p>
          </div>
          {error ? (
            <p role="alert" className="text-[var(--alert)]">
              {error}
            </p>
          ) : null}
          <Button type="submit" thumb disabled={pending}>
            {pending ? "Creating" : "Create client"}
          </Button>
        </form>
      </Sheet>
    </>
  );
}
