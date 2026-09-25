"use client";

import { useOptimistic, useTransition, useState } from "react";
import { Bell } from "lucide-react";
import { setEmailReminders } from "@/features/auth/actions";
import { RowContent } from "./settings";

/** Email reminders on or off. Flips at once and reverts if the save fails. */
export function ReminderToggle({ on }: { on: boolean }) {
  const [shown, setShown] = useOptimistic(on);
  const [error, setError] = useState<string | null>(null);
  const [, start] = useTransition();

  function toggle() {
    const next = !shown;
    setError(null);
    start(async () => {
      setShown(next);
      const result = await setEmailReminders(next);
      if (!result.ok) setError(result.error);
    });
  }

  return (
    <li>
      <button
        type="button"
        role="switch"
        aria-checked={shown}
        onClick={toggle}
        className="block w-full transition-colors duration-[var(--fast)] hover:bg-[var(--surface-2)] active:bg-[var(--line)]"
      >
        <RowContent
          icon={<Bell size={20} strokeWidth={1.75} />}
          label="Renewal reminder emails"
          trailing={
            <span
              aria-hidden
              className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors duration-[var(--fast)] ${
                shown ? "bg-[var(--accent)]" : "bg-[var(--line-strong)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-[left] duration-[var(--fast)] ${
                  shown ? "left-[22px]" : "left-0.5"
                }`}
              />
            </span>
          }
        />
      </button>
      {error ? (
        <p role="alert" className="px-4 pb-3 text-[length:var(--text-small)] text-[var(--alert)] md:px-5">
          {error}
        </p>
      ) : null}
    </li>
  );
}
