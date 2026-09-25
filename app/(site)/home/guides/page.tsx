import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ClosingCta, PageHero, Section } from "@/features/site/components/blocks";
import { WhatsAppCta } from "@/features/site/components/cta";
import { GUIDES } from "@/features/site/guides";
import { pageMeta } from "@/features/site/meta";
import { whatsappLink } from "@/features/site/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = pageMeta({
  title: "Guides for Dubai villa owners and tenants",
  description: "Practical guides for running a villa in Dubai: a seasonal maintenance calendar, a summer travel checklist, Ejari renewal, DEWA moves, and AC and water heater care.",
  path: "/home/guides",
});

export default function GuidesPage() {
  const wa = whatsappLink("Hello Dar, I have a question about my villa.");
  return (
    <>
      <PageHero
        trail={[{ name: "Guides", path: "/home/guides" }]}
        title="Guides"
        lead="Plain, practical guides to running a villa in Dubai, checked against official sources."
      />
      <Section>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/home/guides/${g.slug}`}
                className="group flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)] md:p-7"
              >
                <h2 className="text-[1.25rem] leading-snug">{g.title}</h2>
                <p className="mt-2 flex-1 text-[var(--ink-soft)]">{g.description}</p>
                <span className="mt-5 flex items-center justify-between gap-3 text-[length:var(--text-small)] text-[var(--mute)]">
                  Checked {formatDate(g.checked)}
                  <span className="inline-flex items-center gap-1.5 text-[length:var(--text-body)] font-semibold text-[var(--accent-text)]">
                    Read <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
