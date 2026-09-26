"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  if (sent) {
    return (
      <div role="status" className="space-y-4">
        <MailCheck aria-hidden size={32} className="text-[var(--accent)]" />
        <p>
          If <strong>{email}</strong> has a Dar account, a reset link is on its way. It can take a
          few minutes; check spam too.
        </p>
        <Link href="/sign-in" className="inline-block font-semibold text-[var(--accent-text)] underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const result = await requestPasswordReset(email);
          if (!result.ok) setError(result.error);
          else setSent(true);
        });
      }}
    >
      <div>
        <label htmlFor="email" className="mb-2 block">Your email</label>
        <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full min-h-[48px] px-4" />
      </div>
      {error ? <p role="alert" className="text-[var(--alert)]">{error}</p> : null}
      <Button type="submit" thumb disabled={pending}>{pending ? "Sending" : "Send reset link"}</Button>
      <p className="text-center">
        <Link href="/sign-in" className="text-[var(--accent-text)] underline underline-offset-4">Back to sign in</Link>
      </p>
    </form>
  );
}
