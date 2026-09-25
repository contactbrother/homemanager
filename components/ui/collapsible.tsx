"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** Folded on phones to save the screen for what matters; always open from tablet up. */
export function PhoneCollapsible({
  summary,
  children,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[48px] items-center justify-between gap-3 text-left md:hidden"
      >
        <span className="min-w-0">{summary}</span>
        <ChevronDown
          aria-hidden
          size={20}
          className={`shrink-0 text-[var(--mute)] transition-transform duration-[var(--fast)] ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div className={open ? "pb-1" : "hidden md:block"}>{children}</div>
    </div>
  );
}
