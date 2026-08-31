import Link from "next/link";
import { requireAdmin } from "@/features/auth/guards";
import { signOut } from "@/features/auth/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <nav className="mx-auto max-w-5xl px-6 h-14 flex items-center gap-6">
          <Link href="/admin" className="font-semibold">
            Dar
          </Link>
          <Link href="/admin" className="text-[var(--ink-soft)]">
            Clients
          </Link>
          <Link href="/admin/tasks" className="text-[var(--ink-soft)]">
            Tasks
          </Link>
          <form action={signOut} className="ml-auto">
            <button className="text-[var(--mute)] min-h-[44px]">Sign out</button>
          </form>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-8 flex-1">{children}</main>
    </div>
  );
}
