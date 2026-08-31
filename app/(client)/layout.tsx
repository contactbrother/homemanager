import Link from "next/link";
import { requireClient } from "@/features/auth/guards";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Content first, navigation last: the thumb reaches the bottom. FR-044. */}
      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-8 pb-28">
        {children}
      </main>

      <nav
        aria-label="Main"
        className="fixed bottom-0 inset-x-0 border-t border-[var(--line)] bg-[var(--surface)]"
      >
        <ul className="mx-auto max-w-md grid grid-cols-4">
          {[
            { href: "/", label: "Home" },
            { href: "/properties", label: "Home file" },
            { href: "/tasks", label: "Tasks" },
            { href: "/profile", label: "You" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex min-h-[56px] items-center justify-center text-[length:var(--text-small)]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
