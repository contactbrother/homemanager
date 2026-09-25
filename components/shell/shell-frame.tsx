"use client";

import { usePathname } from "next/navigation";
import { isImmersive } from "./immersive";

/** The phone brand bar. Hidden on immersive screens, which draw their own. */
export function PhoneTopBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isImmersive(pathname)) return null;
  return (
    <header className="md:hidden sticky top-0 z-30 flex h-[var(--topbar-h)] items-center justify-between border-b border-[var(--line)] bg-[var(--bg)]/95 px-5 backdrop-blur pt-[env(safe-area-inset-top)] box-content">
      {children}
    </header>
  );
}

/** Content area. Leaves room for whatever is fixed at the bottom on this screen. */
export function ShellMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const immersive = isImmersive(pathname);
  return (
    <main
      className={[
        "flex-1 md:px-8 md:py-10 lg:px-12",
        immersive
          ? "px-0 pt-0 pb-[calc(88px+env(safe-area-inset-bottom))] md:pb-10"
          : "px-5 pt-6 pb-[calc(var(--tabbar-h)+96px+env(safe-area-inset-bottom))]",
      ].join(" ")}
    >
      {children}
    </main>
  );
}
