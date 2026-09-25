import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { DarMark, DarWordmark } from "@/components/brand/dar-mark";
import { SidebarNav, TabBar } from "./shell-nav";
import type { NavItem } from "./nav-items";

/**
 * The frame every signed-in screen sits in.
 *
 *   phone  (< 768)      top bar, content, bottom tab bar, floating primary action
 *   tablet (768–1199)   76px icon rail on the left, content
 *   desktop (1200 +)    248px labelled sidebar on the left, content
 *
 * `action` is the screen-independent primary action, rendered in the sidebar on
 * larger screens. `phoneAction` is its phone form, floating above the tab bar.
 */
export function AppShell({
  items,
  homeHref,
  team = false,
  action,
  phoneAction,
  sidebarFooter,
  topBarEnd,
  width = "narrow",
  children,
}: {
  items: NavItem[];
  homeHref: string;
  team?: boolean;
  action?: React.ReactNode;
  phoneAction?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  topBarEnd?: React.ReactNode;
  width?: "narrow" | "wide" | "full";
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[76px_minmax(0,1fr)] lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="hidden md:flex sticky top-0 h-dvh flex-col gap-6 border-r border-[var(--line)] bg-[var(--surface)] px-2 py-5 lg:px-4">
        <Link href={homeHref} aria-label="Dar home" className="flex justify-center lg:justify-start lg:px-2">
          <span className="lg:hidden">
            <DarMark size={36} />
          </span>
          <span className="hidden lg:inline-flex">
            <DarWordmark team={team} />
          </span>
        </Link>

        {action ? <div className="flex justify-center lg:block">{action}</div> : null}

        <nav aria-label="Main" className="flex-1">
          <SidebarNav items={items} />
        </nav>

        {sidebarFooter ? (
          <div className="border-t border-[var(--line)] pt-4">{sidebarFooter}</div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="md:hidden sticky top-0 z-30 flex h-[var(--topbar-h)] items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/95 px-5 backdrop-blur pt-[env(safe-area-inset-top)] box-content">
          <Link href={homeHref} aria-label="Dar home">
            <DarWordmark team={team} />
          </Link>
          {topBarEnd}
        </header>

        <main className="flex-1 px-5 pt-6 pb-[calc(var(--tabbar-h)+96px+env(safe-area-inset-bottom))] md:px-8 md:py-10 lg:px-12">
          <div className={`mx-auto w-full ${width === "full" ? "max-w-6xl" : width === "wide" ? "max-w-5xl" : "max-w-3xl"}`}>
            {children}
          </div>
        </main>
      </div>

      {phoneAction}
      <TabBar items={items} />
    </div>
  );
}

/** Help link for the sidebar footer. Hidden when no support number is configured. */
export function SidebarHelp() {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number}`}
      className="flex min-h-[60px] flex-col items-center justify-center gap-1 rounded-[var(--r-md)] px-1 text-[length:var(--text-tiny)] font-medium text-[var(--ink-soft)] hover:bg-[var(--surface-2)] lg:min-h-[44px] lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:text-[length:var(--text-body)]"
    >
      <MessageCircle aria-hidden size={20} strokeWidth={1.75} />
      <span className="leading-tight text-center lg:text-left">Help</span>
    </a>
  );
}
