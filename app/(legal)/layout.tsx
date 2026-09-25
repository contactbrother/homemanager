import Link from "next/link";
import { DarWordmark } from "@/components/brand/dar-mark";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-[var(--topbar-h)] max-w-3xl items-center justify-between px-5">
          <Link href="/home" aria-label="Dar home">
            <DarWordmark />
          </Link>
          <Link href="/" className="inline-flex min-h-[44px] items-center font-medium text-[var(--accent-text)]">
            Back to Dar
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 pb-[calc(40px+env(safe-area-inset-bottom))] md:py-12">
        <p className="mb-6 rounded-[var(--r-md)] border border-[var(--warn)]/30 bg-[var(--warn-soft)] px-4 py-3 text-[length:var(--text-small)] text-[var(--warn)]">
          DRAFT. This page is being reviewed and may change before Dar launches publicly.
        </p>
        <article className="legal">{children}</article>
      </main>
    </div>
  );
}
