import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CheckList, ClosingCta, FaqList, PageHero, Section, Steps } from "@/features/site/components/blocks";
import { SecondaryCta, WhatsAppCta } from "@/features/site/components/cta";
import { ServiceIcon } from "@/features/site/components/illustrations";
import { JsonLd } from "@/features/site/components/json-ld";
import { COMMUNITIES, SERVICES, SITE_URL, whatsappLink } from "@/features/site/content";
import { SERVICE_DETAILS } from "@/features/site/service-details";

export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  if (!service) return {};
  return pageMeta({ title: service.title, description: service.description, path: `/home/${slug}` });
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);
  const detail = SERVICE_DETAILS[slug];
  if (!service || !detail) notFound();

  const wa = whatsappLink(`Hello Dar, I am interested in ${service.name.toLowerCase()} for my villa.`);
  const others = SERVICES.filter((s) => s.slug !== slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          serviceType: service.title,
          description: service.description,
          url: `${SITE_URL}/home/${slug}`,
          provider: { "@id": `${SITE_URL}/home#organization` },
          areaServed: COMMUNITIES.map((name) => ({ "@type": "Place", name: `${name}, Dubai` })),
        }}
      />
      <PageHero
        trail={[{ name: service.name, path: `/home/${slug}` }]}
        title={service.title}
        lead={detail.lead}
        aside={
          <div className="flex justify-center">
            <ServiceIcon kind={service.icon} size={200} />
          </div>
        }
      >
        <WhatsAppCta href={wa} />
        <SecondaryCta href="/home/contact">Send an enquiry</SecondaryCta>
      </PageHero>

      <Section title="What is included">
        <CheckList items={detail.included} />
      </Section>

      <Section title="How it works" className="border-y border-[var(--line)] bg-[var(--surface)]">
        <Steps steps={detail.steps} />
      </Section>

      <Section title="Who it is for">
        <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
          {detail.forWho.map((line) => (
            <li key={line} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 text-[1.0625rem]">
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-[var(--ink-soft)]">
          Available in {COMMUNITIES.slice(0, -1).join(", ")} and {COMMUNITIES[COMMUNITIES.length - 1]}.
        </p>
      </Section>

      <Section title="Questions" className="pt-0 md:pt-0">
        <FaqList items={detail.faq} />
      </Section>

      <Section title="Goes well with" className="pt-0 md:pt-0">
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
          {others.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/home/${s.slug}`}
                className="group flex items-center gap-4 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
              >
                <ServiceIcon kind={s.icon} size={48} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{s.name}</span>
                  <span className="block text-[length:var(--text-small)] text-[var(--ink-soft)]">{s.short}</span>
                </span>
                <ArrowRight aria-hidden size={20} className="shrink-0 text-[var(--accent-text)]" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
