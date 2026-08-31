"use client";

import { useEffect, useState, useTransition } from "react";
import { requestSignInLink } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { RESEND_LOCK_SECONDS } from "@/lib/constants";

/**
 * FR-051. The resend control is locked for 60 seconds so that ordinary impatience
 * does not consume the hourly allowance in FR-045. The allowance itself is enforced
 * by Supabase, not here; this is a courtesy, not a security control.
 */
export function CheckEmail({ email }: { email: string }) {
  const [seconds, setSeconds] = useState(RESEND_LOCK_SECONDS);
  const [sentAgain, setSentAgain] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  if (!email) return null;

  function resend() {
    start(async () => {
      await requestSignInLink(email);
      setSentAgain(true);
      setSeconds(RESEND_LOCK_SECONDS);
    });
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        thumb
        onClick={resend}
        disabled={seconds > 0 || pending}
      >
        {seconds > 0
          ? `Send another in ${seconds}s`
          : pending
            ? "Sending"
            : "Send another"}
      </Button>
      <p aria-live="polite" className="text-center text-[var(--mute)]">
        {sentAgain && seconds > 0 ? "Sent again." : " "}
      </p>
    </div>
  );
}
