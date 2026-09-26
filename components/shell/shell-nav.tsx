"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarClock,
  FolderOpen,
  House,
  Inbox,
  ListChecks,
  UserRound,
  UsersRound,
  Wrench,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { isActive, type IconName, type NavItem } from "./nav-items";
import { isImmersive } from "./immersive";

const ICONS: Record<IconName, LucideIcon> = {
  home: House,
  file: FolderOpen,
  requests: ListChecks,
  account: UserRound,
  clients: UsersRound,
  inbox: Inbox,
  renewals: CalendarClock,
  vendors: Wrench,
  enquiries: Mail,
};

/**
 * One navigation, three forms. The sidebar is an icon rail on tablets and a labelled
 * list on desktops; phones get a bottom tab bar within reach of the thumb (FR-044).
 */
export function SidebarNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item, pathname);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "group flex items-center rounded-[var(--r-md)] transition-colors duration-[var(--fast)]",
                "min-h-[60px] flex-col justify-center gap-1 px-1 text-[length:var(--text-tiny)]",
                "lg:min-h-[44px] lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-[length:var(--text-body)]",
                active
                  ? "bg-[var(--accent-soft)] text-[var(--accent-text)] font-semibold"
                  : "text-[var(--ink-soft)] font-medium hover:bg-[var(--surface-2)] hover:text-[var(--ink)]",
              ].join(" ")}
            >
              <span className="relative shrink-0">
                <Icon aria-hidden size={20} strokeWidth={active ? 2.25 : 1.75} />
                <Badge count={item.badge} className="lg:hidden" />
              </span>
              <span className="leading-tight text-center lg:flex-1 lg:text-left">{item.label}</span>
              {item.badge ? (
                <span className="hidden min-w-[22px] rounded-full bg-[var(--alert)] px-1.5 text-center text-[length:var(--text-tiny)] font-bold leading-[22px] text-white lg:inline-block">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  if (isImmersive(pathname)) return null;

  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex h-[var(--tabbar-h)] flex-col items-center justify-center gap-1 text-[length:var(--text-tiny)] active:opacity-70",
                  active ? "text-[var(--accent-text)] font-semibold" : "text-[var(--mute)] font-medium",
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-7 w-14 items-center justify-center rounded-[var(--r-full)] transition-colors duration-[var(--fast)]",
                    active ? "bg-[var(--accent-soft)]" : "",
                  ].join(" ")}
                >
                  <span className="relative">
                    <Icon aria-hidden size={20} strokeWidth={active ? 2.25 : 1.75} />
                    <Badge count={item.badge} />
                  </span>
                </span>
                {item.label}
                {item.badge ? <span className="sr-only">, {item.badge} with new updates</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function Badge({ count, className = "" }: { count?: number; className?: string }) {
  if (!count) return null;
  return (
    <span
      aria-hidden
      className={`absolute -right-2.5 -top-2 min-w-[18px] rounded-full border-2 border-[var(--surface)] bg-[var(--alert)] px-1 text-center text-[10px] font-bold leading-[14px] text-white ${className}`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
