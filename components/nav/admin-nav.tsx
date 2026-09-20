"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Clients", exact: true },
  { href: "/admin/tasks", label: "Tasks", exact: false },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = item.exact
          ? pathname === item.href || pathname.startsWith("/admin/clients")
          : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "inline-flex min-h-[44px] items-center rounded-[var(--r-md)] px-3 font-medium",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--surface-2)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
