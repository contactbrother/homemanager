import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/**
 * The top bar of a full-screen phone view: back, title, and up to two actions.
 * From tablet up the shell's sidebar is present, so a plain back link is shown instead.
 */
export function ScreenBar({
  backHref,
  backLabel,
  title,
  subtitle,
  actions,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <>
      <header className="md:hidden sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="flex h-[var(--topbar-h)] items-center gap-1 px-1.5">
          <Link
            href={backHref}
            aria-label={backLabel}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--r-md)] text-[var(--ink)] active:bg-[var(--surface-2)]"
          >
            <ChevronLeft aria-hidden size={24} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold leading-tight">{title}</p>
            {subtitle ? (
              <div className="truncate text-[length:var(--text-tiny)] text-[var(--mute)]">{subtitle}</div>
            ) : null}
          </div>
          <div id="screen-bar-actions" className="flex shrink-0 items-center">
            {actions}
          </div>
        </div>
      </header>

      <Link
        href={backHref}
        className="-ml-1 mb-2 hidden min-h-[44px] items-center gap-1 text-[var(--ink-soft)] hover:text-[var(--ink)] md:inline-flex lg:hidden"
      >
        <ChevronLeft aria-hidden size={18} />
        {backLabel}
      </Link>
    </>
  );
}

/** An icon button sized for the thumb, for ScreenBar actions. */
export function BarIconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] text-[var(--ink)] active:bg-[var(--surface-2)] disabled:opacity-40"
      {...props}
    >
      {children}
    </button>
  );
}
