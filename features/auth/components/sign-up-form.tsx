"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { signUpWithPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

const field =
  "w-full min-h-[44px] px-4 rounded-[var(--r-md)] border border-[var(--line)] bg-[var(--surface)]";

export function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      // On success the action redirects; only a failure or a confirmation
      // requirement returns here.
      const result = await signUpWithPassword({ fullName, email, password });
      if (!result) return;
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.data.needsConfirmation) setNeedsConfirmation(true);
    });
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-4">
        <p>
          Your account is created. Check <strong>{email.trim().toLowerCase()}</strong>{" "}
          for a confirmation link, then sign in.
        </p>
        <Link href="/sign-in" className="block">
          <Button type="button" variant="outline" thumb>
            Go to sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block mb-2">
          Your name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className={field}
        />
      </div>

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
        <label htmlFor="password" className="block mb-2">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={field}
        />
        <p className="mt-2 text-[var(--mute)]">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>

      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" thumb disabled={pending}>
        {pending ? "Creating account" : "Create account"}
      </Button>

      <p className="text-center text-[var(--ink-soft)]">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-[var(--gold-text)] underline underline-offset-4 inline-flex min-h-[44px] items-center"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
