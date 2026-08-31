"use client";

import { Button } from "@/components/ui/button";

/** FR-043. Say what happened and what to do next. Never a dead state. */
export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-12 text-center">
      <p>We could not load this just now.</p>
      <p className="mt-2 text-[var(--mute)]">
        It is usually the connection. Try again, and message the team if it keeps
        happening.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
