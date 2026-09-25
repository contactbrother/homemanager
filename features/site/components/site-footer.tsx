import Link from "next/link";
import { DarWordmark } from "@/components/brand/dar-mark";
import { COMMUNITIES, SERVICES } from "@/features/site/content";

export function SiteFooter({ whatsapp }: { whatsapp: string | null }) {
  const col = "space-y-2.5";
  const link = "text-[var(--ink-soft)] hover:text-[var(--ink)]";
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 pb-[calc(96px+env(safe-area-inset-bottom))] md:grid-cols-4 md:px-8 md:pb-12">
        <div>
          <DarWordmark />
          <p className="mt-4 max-w-xs text-[var(--ink-soft)]">
            Household management for villas in Dubai. One team for your home&apos;s records, renewals and upkeep.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-[length:var(--text-small)] font-semibold text-[var(--mute)]">Services</h2>
          <ul className={col}>
            {SERVICES.map((s) => (
              <li key={s.slug}>
                <Link href={`/home/${s.slug}`} className={link}>
                  {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/home/how-it-works" className={link}>
                How it works
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[length:var(--text-small)] font-semibold text-[var(--mute)]">Areas we serve</h2>
          <ul className={col}>
            {COMMUNITIES.map((c) => (
              <li key={c} className="text-[var(--ink-soft)]">
                {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-[length:var(--text-small)] font-semibold text-[var(--mute)]">Dar</h2>
          <ul className={col}>
            <li><Link href="/home/about" className={link}>About</Link></li>
            <li><Link href="/home/faq" className={link}>FAQ</Link></li>
            <li><Link href="/home/contact" className={link}>Contact</Link></li>
            {whatsapp ? <li><a href={whatsapp} className={link}>WhatsApp</a></li> : null}
            <li><Link href="/sign-in" className={link}>Client sign in</Link></li>
            <li><Link href="/privacy" className={link}>Privacy</Link></li>
            <li><Link href="/terms" className={link}>Terms</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-[var(--line)] px-5 py-5 text-center text-[length:var(--text-small)] text-[var(--mute)]">
        Dar, Dubai
      </p>
    </footer>
  );
}
