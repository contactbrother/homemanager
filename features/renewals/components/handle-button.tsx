"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { handleRenewal } from "@/features/renewals/actions";
import { Button } from "@/components/ui/button";
import type { RenewalItem } from "@/features/renewals/types";

/** One tap turns a renewal into a request. Opens the request when done. */
export function HandleRenewalButton({
  item,
  href = "/tasks",
  label = "Ask Dar to handle",
}: {
  item: RenewalItem;
  href?: string;
  label?: string;
}) {
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
            const result = await handleRenewal({
              propertyId: item.propertyId,
              title: item.title,
              dueOn: item.dueOn,
              days: item.days,
              kind: item.kind,
            });
            if (!result.ok) {
              setError(result.error);
              return;
            }
            navigator.vibrate?.(12);
            router.push(`${href}/${result.data.id}`);
          })
        }
      >
        {pending ? "Sending" : label}
      </Button>
      {error ? (
        <p role="alert" className="text-[var(--alert)]">
          {error}
        </p>
      ) : null}
    </>
  );
}
