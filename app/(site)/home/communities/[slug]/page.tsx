import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { CheckList, ClosingCta, FaqList, PageHero, Section } from "@/features/site/components/blocks";
import { SecondaryCta, WhatsAppCta } from "@/features/site/components/cta";
import { ServiceIcon } from "@/features/site/components/illustrations";
import { JsonLd } from "@/features/site/components/json-ld";
import { COMMUNITY_PAGES } from "@/features/site/communities";
import { guideBySlug } from "@/features/site/guides";
import { pageMeta } from "@/features/site/meta";
import { SERVICES, SITE_URL, whatsappLink } from "@/features/site/content";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;
const CHECKED = "2026-09-26";

export function generateStaticParams() {
  return COMMUNITY_PAGES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = COMMUNITY_PAGES.find((x) => x.slug === slug);
  if (!c) return {};
  return pageMeta({ title: c.title, description: c.description, path: `/home/communities/${slug}` });
}

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMMUNITY_PAGES.find((x) => x.slug === slug);
  if (!c) notFound();
  const wa = whatsappLink(`Hello Dar, I live in ${c.name} and would like to know more.`);
  const guides = c.guides.map(guideBySlug).filter((g): g is NonNullable<typeof g> => Boolean(g));
  const others = COMMUNITY_PAGES.filter((x) => x.slug !== slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: c.title,
          serviceType: "Villa household management",
          description: c.description,
          url: `${SITE_URL}/home/communities/${slug}`,
          provider: { "@id": `${SITE_URL}/home#organization` },
          areaServed: { "@type": "Place", name: `${c.name}, Dubai` },
        }}
      />
      <PageHero
        trail={[
          { name: "Areas we serve", path: "/home/communities" },
          { name: c.name, path: `/home/communities/${slug}` },
        ]}
        title={c.title}
        lead={c.intro}
      >
        <WhatsAppCta href={wa} />
        <SecondaryCta href="/home/contact">Send an enquiry</SecondaryCta>
      </PageHero>

      <Section title={`${c.name} at a glance`}>
        <dl className="grid gap-px overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {c.facts.map(([k, v]) => (
            <div key={k} className="bg-[var(--surface)] p-5 md:p-6">
              <dt className="text-[length:var(--text-small)] text-[var(--mute)]">{k}</dt>
              <dd className="mt-1 text-[1.0625rem] font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[length:var(--text-small)] text-[var(--mute)]">Checked {formatDate(CHECKED)}. Community rules change; check with your community management before any works.</p>
      </Section>

      <Section title={`What homes in ${c.name} need`} className="border-y border-[var(--line)] bg-[var(--surface)]">
        <CheckList items={c.needs} />
      </Section>

      <Section title={`How Dar helps in ${c.name}`}>
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link href={`/home/${s.slug}`} className="group flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--accent)]">
                <ServiceIcon kind={s.icon} size={48} />
                <h3 className="mt-4 text-[1.125rem]">{s.name}</h3>
                <p className="mt-2 flex-1 text-[var(--ink-soft)]">{s.short}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-semibold text-[var(--accent-text)]">
                  Learn more <ArrowRight aria-hidden size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Questions" className="pt-0 md:pt-0">
        <FaqList items={c.faq} />
      </Section>

      {guides.length ? (
        <Section title="Useful guides" className="pt-0 md:pt-0">
          <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link href={`/home/guides/${g.slug}`} className="flex h-full items-start gap-3 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]">
                  <BookOpen aria-hidden size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
                  <span className="font-semibold">{g.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section className="pt-0 md:pt-0">
        <p className="text-[var(--ink-soft)]">
          We also look after homes in{" "}
          {others.map((o, i) => (
            <span key={o.slug}>
              <Link href={`/home/communities/${o.slug}`} className="font-medium text-[var(--accent-text)] underline underline-offset-4">{o.name}</Link>
              {i < others.length - 2 ? ", " : i === others.length - 2 ? " and " : "."}
            </span>
          ))}
        </p>
      </Section>

      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
