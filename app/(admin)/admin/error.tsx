"use client";

import { Button } from "@/components/ui/button";

/** FR-043. Plain and functional, as the admin area is meant to be, but still honest
 *  about what happened and what to do next. */
export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-12">
      <p>We could not load this.</p>
      <p className="mt-2 text-[var(--mute)]">
        Try again. If it keeps happening, check the Supabase project is reachable.
      </p>
      <div className="mt-6">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
