"use client";

import { Button } from "@/components/ui/button";

/** FR-043. Say what happened and what to do next. Never a dead state. */
export function ErrorState({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] px-5 py-10 text-center">
      <p className="font-semibold">This page did not load.</p>
      <p className="mx-auto mt-2 max-w-sm text-[var(--mute)]">
        It is usually the connection. Try again, and message the team if it keeps happening.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
