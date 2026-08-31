"use client";

import { useState, useTransition } from "react";
import { deactivateClient, reactivateClient } from "@/features/clients/actions";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { formatDate } from "@/lib/format";

/**
 * FR-046, FR-055. Secondary and outline, never the primary action on this screen:
 * it is destructive in effect and must not be the easiest thing to press.
 */
export function DeactivateControl({
  profileId,
  deactivatedAt,
  name,
}: {
  profileId: string;
  deactivatedAt: string | null;
  name: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function act() {
    setError(null);
    start(async () => {
      const result = deactivatedAt
        ? await reactivateClient(profileId)
        : await deactivateClient(profileId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirming(false);
    });
  }

  if (deactivatedAt) {
    return (
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-[var(--mute)]">
          Deactivated {formatDate(deactivatedAt)}. Records are kept for 90 days, then
          deleted by the team.
        </p>
        <Button variant="outline" onClick={act} disabled={pending}>
          {pending ? "Restoring" : "Restore access"}
        </Button>
        {error ? (
          <p role="alert" className="text-[var(--alert)]">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <Button variant="danger" onClick={() => setConfirming(true)}>
        Deactivate client
      </Button>
      <Sheet
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Deactivate client"
      >
        <p>
          {name} will lose access immediately, including any session they are using
          right now. Their records stay visible to the team.
        </p>
        <p className="mt-3 text-[var(--mute)]">
          Policy is to delete their files 90 days after deactivation. Nothing does that
          automatically yet, so it remains a job for the team.
        </p>
        {error ? (
          <p role="alert" className="mt-3 text-[var(--alert)]">
            {error}
          </p>
        ) : null}
        <div className="mt-6 space-y-3">
          <Button variant="danger" thumb onClick={act} disabled={pending}>
            {pending ? "Deactivating" : "Deactivate"}
          </Button>
          <Button variant="text" thumb onClick={() => setConfirming(false)}>
            Keep access
          </Button>
        </div>
      </Sheet>
    </>
  );
}
