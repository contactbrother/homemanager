"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/properties", label: "Home file" },
  { href: "/tasks", label: "Tasks" },
  { href: "/profile", label: "You" },
];

/** Bottom navigation with the current section marked. FR-044. */
export function ClientNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 inset-x-0 border-t border-[var(--line)] bg-[var(--surface)] pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto max-w-md grid grid-cols-4">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-[56px] flex-col items-center justify-center gap-1 text-[length:var(--text-small)] border-t-2 -mt-px",
                  active
                    ? "border-[var(--accent)] text-[var(--accent-text)] font-semibold"
                    : "border-transparent text-[var(--mute)]",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
