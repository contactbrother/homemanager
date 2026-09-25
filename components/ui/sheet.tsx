"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Bottom sheet on phones, centred dialog on larger screens, for create and edit flows.
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
  // Callers pass an inline arrow, which is a new function on every render. If the
  // effect below depended on it, every keystroke in the sheet would tear down and
  // re-run the focus management, which on a phone dismisses the keyboard.
  const close = useRef(onClose);
  close.current = onClose;

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
        close.current();
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
  }, [open]);

  if (!open) return null;

  // Phone: a bottom sheet with a grab handle. Tablet and desktop: a centred dialog.
  // Both cap their height and scroll inside, so long forms never run off screen.
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center md:p-6">
      <div
        className="absolute inset-0 bg-[var(--ink)]/45"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex w-full max-h-[92dvh] flex-col bg-[var(--surface)] rounded-t-[20px]
                   md:max-w-lg md:max-h-[85dvh] md:rounded-[var(--r-lg)] shadow-[0_12px_40px_rgba(24,34,30,0.18)]
                   motion-safe:animate-[rise_var(--base)_var(--ease)] md:motion-safe:animate-[settle_var(--base)_var(--ease)]"
      >
        <div className="md:hidden flex justify-center pt-2.5" aria-hidden>
          <span className="h-1 w-10 rounded-[var(--r-full)] bg-[var(--line-strong)]" />
        </div>
        <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-3 md:px-6 md:py-4">
          <h2 className="text-[length:var(--text-heading)]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] text-[var(--mute)] hover:bg-[var(--surface-2)] hover:text-[var(--ink)]"
          >
            <X aria-hidden size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-[calc(24px+env(safe-area-inset-bottom))] md:px-6 md:pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
