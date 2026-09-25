"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { DarWordmark } from "@/components/brand/dar-mark";

const NAV = [
  { href: "/home/house-management", label: "House management" },
  { href: "/home/documents-and-renewals", label: "Documents" },
  { href: "/home/home-watch", label: "Home watch" },
  { href: "/home/how-it-works", label: "How it works" },
  { href: "/home/communities", label: "Areas" },
  { href: "/home/guides", label: "Guides" },
];

export function SiteHeader({ whatsapp }: { whatsapp: string | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--bg)]/92 backdrop-blur pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/home" aria-label="Dar home">
          <DarWordmark />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? "page" : undefined}
                  className={`rounded-[var(--r-md)] px-3 py-2 font-medium transition-colors hover:text-[var(--ink)] ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`) ? "text-[var(--accent-text)]" : "text-[var(--ink-soft)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/sign-in" className="hidden min-h-[44px] items-center px-3 font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] md:inline-flex">
            Client sign in
          </Link>
          {whatsapp ? (
            <a
              href={whatsapp}
              className="hidden min-h-[44px] items-center rounded-[var(--r-full)] bg-[var(--accent)] px-5 font-semibold text-white transition-colors hover:bg-[var(--accent-text)] md:inline-flex"
            >
              Chat on WhatsApp
            </a>
          ) : null}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--r-md)] text-[var(--ink)] active:bg-[var(--surface-2)] lg:hidden"
          >
            {open ? <X aria-hidden size={24} /> : <Menu aria-hidden size={24} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-x-0 bottom-0 top-[calc(4rem+env(safe-area-inset-top))] z-40 overflow-y-auto bg-[var(--bg)] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-4 lg:hidden">
          <ul className="divide-y divide-[var(--line)]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex min-h-[56px] items-center text-[1.125rem] font-semibold">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/home/faq" className="flex min-h-[56px] items-center text-[1.125rem] font-semibold">
                Questions and answers
              </Link>
            </li>
            <li>
              <Link href="/home/about" className="flex min-h-[56px] items-center text-[1.125rem] font-semibold">
                About Dar
              </Link>
            </li>
            <li>
              <Link href="/home/contact" className="flex min-h-[56px] items-center text-[1.125rem] font-semibold">
                Contact
              </Link>
            </li>
          </ul>
          <div className="mt-6 grid gap-3">
            {whatsapp ? (
              <a href={whatsapp} className="inline-flex min-h-[52px] items-center justify-center rounded-[var(--r-full)] bg-[var(--accent)] font-semibold text-white">
                Chat on WhatsApp
              </a>
            ) : null}
            <Link href="/sign-in" className="inline-flex min-h-[52px] items-center justify-center rounded-[var(--r-full)] border border-[var(--line-strong)] bg-[var(--surface)] font-semibold">
              Client sign in
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
