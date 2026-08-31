"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestSignInLink } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await requestSignInLink(email);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(
        `/sign-in/check-email?to=${encodeURIComponent(email.trim().toLowerCase())}`,
      );
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block mb-2">
          Your email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]"
        />
      </div>

      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}

      {/* The single primary action, in the lower third. FR-044. */}
      <Button type="submit" thumb disabled={pending}>
        {pending ? "Sending" : "Send me a link"}
      </Button>
    </form>
  );
}
