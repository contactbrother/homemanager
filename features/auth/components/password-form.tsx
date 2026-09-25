"use client";

import { useState, useTransition } from "react";
import { changePassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    start(async () => {
      const result = await changePassword({ current, next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setCurrent("");
      setNext("");
      setMessage("Password changed.");
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block mb-2">
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          className="w-full min-h-[44px] px-4"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block mb-2">
          New password
        </label>
        <input
          id="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          aria-describedby="newPasswordHint"
          className="w-full min-h-[44px] px-4"
        />
        <p id="newPasswordHint" className="mt-1.5 text-[length:var(--text-small)] text-[var(--mute)]">
          At least {MIN_PASSWORD_LENGTH} characters.
        </p>
      </div>
      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}
      {message ? (
        <p aria-live="polite" className="text-[var(--ok)] font-medium">
          {message}
        </p>
      ) : null}
      <Button type="submit" variant="outline" disabled={pending || !current || !next}>
        {pending ? "Changing" : "Change password"}
      </Button>
    </form>
  );
}
