import Link from "next/link";
import { requireAdmin } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";
import { AdminNav } from "@/components/nav/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--surface)]">
        <nav className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center gap-4">
          <Link
            href="/admin"
            className="font-display text-[length:var(--text-heading)] font-semibold tracking-tight"
          >
            Dar
          </Link>
          <span className="rounded-[var(--r-sm)] border border-[var(--line)] px-1.5 py-0.5 text-[length:var(--text-tiny)] font-semibold uppercase tracking-wide text-[var(--mute)]">
            Team
          </span>
          <AdminNav />
          <form action={signOut} className="ml-auto">
            <button className="min-h-[44px] px-2 text-[var(--ink-soft)] hover:text-[var(--ink)]">
              Sign out
            </button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 flex-1">{children}</main>
    </div>
  );
}
