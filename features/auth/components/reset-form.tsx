"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setNewPassword } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD_LENGTH } from "@/lib/constants";

export function ResetForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const result = await setNewPassword(password);
          if (!result.ok) {
            setError(result.error);
            return;
          }
          router.replace("/");
          router.refresh();
        });
      }}
    >
      <div>
        <label htmlFor="password" className="mb-2 block">New password</label>
        <input id="password" type="password" required minLength={MIN_PASSWORD_LENGTH} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full min-h-[48px] px-4" aria-describedby="hint" />
        <p id="hint" className="mt-1.5 text-[length:var(--text-small)] text-[var(--mute)]">At least {MIN_PASSWORD_LENGTH} characters.</p>
      </div>
      {error ? <p role="alert" className="text-[var(--alert)]">{error}</p> : null}
      <Button type="submit" thumb disabled={pending}>{pending ? "Saving" : "Save new password"}</Button>
    </form>
  );
}
