"use client";

import { useEffect, useRef } from "react";

/**
 * Bottom sheet for create and detail flows on mobile, not full page navigation.
 *
 * Traps focus while open by design, and releases it on close, restoring focus to
 * whatever opened it. FR-054 requires both: a trap that never releases is the failure
 * mode the requirement names.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    opener.current = document.activeElement as HTMLElement | null;
    const node = panel.current;
    node?.querySelector<HTMLElement>(
      "input, textarea, select, button, [href], [tabindex]:not([tabindex='-1'])",
    )?.focus();

    function focusables() {
      return Array.from(
        node?.querySelectorAll<HTMLElement>(
          "input, textarea, select, button, [href], [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      opener.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      <div
        className="absolute inset-0 bg-[var(--ink)]/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full sm:max-w-md bg-[var(--surface)] rounded-t-[var(--r-lg)] sm:rounded-[var(--r-lg)] p-5 pb-8 shadow-lg
                   motion-safe:animate-[sheet_var(--base)_var(--ease)]"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-[length:var(--text-heading)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 text-[var(--mute)]"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <style>{`@keyframes sheet{from{transform:scale(.98) translateY(8px);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  );
}
