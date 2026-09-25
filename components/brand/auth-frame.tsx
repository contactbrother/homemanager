import { DarMark } from "./dar-mark";

/**
 * Sign in and sign up. Phones get the form alone under the mark. From tablet up a palm
 * panel with the villa arch sits beside it, the one large use of the brand.
 */
export function AuthFrame({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-cols-2">
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-[var(--accent)] md:flex md:flex-col md:p-10 lg:p-14"
      >
        <div className="flex items-center gap-3">
          <DarMark size={40} className="[&_rect]:fill-[var(--sand)] [&_path:first-of-type]:fill-[var(--accent)] [&_path:last-of-type]:fill-[var(--sand)]" />
          <span className="text-[1.5rem] font-bold tracking-[-0.02em] text-white">Dar</span>
        </div>

        <p className="relative mt-16 max-w-sm text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-white lg:text-[2.125rem]">
          Everything about your home, in one place.
        </p>

        <svg
          viewBox="0 0 400 420"
          className="pointer-events-none absolute -bottom-10 left-1/2 w-[90%] max-w-[480px] -translate-x-1/2"
        >
          <path d="M40 420V200a160 160 0 0 1 320 0v220z" fill="none" stroke="var(--sand)" strokeWidth="2" opacity=".35" />
          <path d="M90 420V210a110 110 0 0 1 220 0v210z" fill="none" stroke="var(--sand)" strokeWidth="2" opacity=".55" />
          <path d="M140 420V220a60 60 0 0 1 120 0v200z" fill="var(--sand)" opacity=".9" />
        </svg>

      </aside>

      <div className="flex min-h-dvh flex-col px-6 py-10 md:min-h-0 md:px-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          <DarMark size={44} className="md:hidden" />
          <h1 className="mt-6 text-[length:var(--text-display)] md:mt-0">{title}</h1>
          <p className="mt-2 text-[var(--ink-soft)]">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
