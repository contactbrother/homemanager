"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signInWithPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

const field =
  "w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      // On success the action redirects; only a failure returns here.
      const result = await signInWithPassword({ email, password });
      if (result && !result.ok) setError(result.error);
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
          className={field}
        />
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <label htmlFor="password">Password</label>
          <Link href="/forgot-password" className="text-[length:var(--text-small)] font-medium text-[var(--accent-text)] underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
      </div>

      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}

      {/* The single primary action, in the lower third. FR-044. */}
      <Button type="submit" thumb disabled={pending}>
        {pending ? "Signing in" : "Sign in"}
      </Button>

      <p className="text-center text-[var(--ink-soft)]">
        New to Dar?{" "}
        <Link
          href="/sign-up"
          className="text-[var(--accent-text)] underline underline-offset-4 inline-flex min-h-[44px] items-center"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
