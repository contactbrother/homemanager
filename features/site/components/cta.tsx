import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppCta({
  href,
  label = "Chat on WhatsApp",
  size = "lg",
  inverse = false,
}: {
  href: string | null;
  label?: string;
  size?: "lg" | "md";
  /** White button, for use on the palm band. */
  inverse?: boolean;
}) {
  if (!href) {
    return (
      <Link href="/home/contact" className={base(size, true, inverse)}>
        Get in touch
      </Link>
    );
  }
  return (
    <a href={href} className={base(size, true, inverse)}>
      <MessageCircle aria-hidden size={20} />
      {label}
    </a>
  );
}

export function SecondaryCta({ href, children, size = "lg" }: { href: string; children: React.ReactNode; size?: "lg" | "md" }) {
  return (
    <Link href={href} className={base(size, false)}>
      {children}
    </Link>
  );
}

function base(size: "lg" | "md", primary: boolean, inverse = false) {
  return [
    "inline-flex items-center justify-center gap-2 rounded-[var(--r-full)] font-semibold transition-[transform,background-color] duration-[var(--fast)] active:scale-[0.98]",
    size === "lg" ? "min-h-[52px] px-7 text-[1.0625rem]" : "min-h-[44px] px-5",
    inverse
      ? "bg-white text-[var(--accent-text)] hover:bg-[var(--accent-soft)]"
      : primary
      ? "bg-[var(--accent)] text-white hover:bg-[var(--accent-text)]"
      : "border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--ink-soft)]",
  ].join(" ");
}

/** Phone only: a WhatsApp button that is always within reach. */
export function FloatingWhatsApp({ href }: { href: string | null }) {
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label="Chat with Dar on WhatsApp"
      className="fixed bottom-[calc(16px+env(safe-area-inset-bottom))] right-4 z-30 inline-flex h-14 items-center gap-2 rounded-[var(--r-full)] bg-[var(--accent)] pl-5 pr-6 font-semibold text-white shadow-[0_8px_24px_rgba(24,34,30,0.25)] active:scale-[0.97] md:hidden"
    >
      <MessageCircle aria-hidden size={20} />
      WhatsApp
    </a>
  );
}
