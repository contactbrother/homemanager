import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { ClosingCta, PageHero, Section } from "@/features/site/components/blocks";
import { WhatsAppCta } from "@/features/site/components/cta";
import { COMMUNITY_PAGES } from "@/features/site/communities";
import { pageMeta } from "@/features/site/meta";
import { whatsappLink } from "@/features/site/content";

export const metadata: Metadata = pageMeta({
  title: "Areas we serve",
  description: "Dar looks after villas and townhouses in Jumeirah Park, The Springs, The Meadows and Arabian Ranches. See what homes in each community need.",
  path: "/home/communities",
});

export default function CommunitiesPage() {
  const wa = whatsappLink("Hello Dar, do you cover my community?");
  return (
    <>
      <PageHero
        trail={[{ name: "Areas we serve", path: "/home/communities" }]}
        title="Areas we serve"
        lead="Four established villa communities, each with its own homes, rules and rhythms. Here is what we look after in each."
      />
      <Section>
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {COMMUNITY_PAGES.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/home/communities/${c.slug}`}
                className="group flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)] md:p-7"
              >
                <MapPin aria-hidden size={24} strokeWidth={1.75} className="text-[var(--accent)]" />
                <h2 className="mt-4 text-[1.375rem]">{c.name}</h2>
                <p className="mt-2 flex-1 text-[var(--ink-soft)]">{c.facts[1][1]}. {c.facts[0][0]}: {c.facts[0][1]}.</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-[var(--accent-text)]">
                  Homes in {c.name}
                  <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[var(--ink-soft)]">Nearby but not listed? Message us and we will tell you whether we can help.</p>
      </Section>
      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
