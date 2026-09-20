"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logService } from "@/features/assets/actions";
import { Button } from "@/components/ui/button";

/** One tap records a service done today. FR-041 style: no confirmation modal. */
export function LogServiceButton({ assetId, propertyId }: { assetId: string; propertyId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <>
      <Button
        variant="text"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const result = await logService({ id: assetId, propertyId });
            if (!result.ok) setError(result.error);
            else router.refresh();
          })
        }
      >
        {pending ? "Saving" : "Serviced today"}
      </Button>
      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}
    </>
  );
}
