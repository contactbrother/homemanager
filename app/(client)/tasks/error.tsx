"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function PageError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} />;
}
