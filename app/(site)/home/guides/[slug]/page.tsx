import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs, ClosingCta, Container } from "@/features/site/components/blocks";
import { WhatsAppCta } from "@/features/site/components/cta";
import { ServiceIcon } from "@/features/site/components/illustrations";
import { JsonLd } from "@/features/site/components/json-ld";
import { GUIDES, guideBySlug, type Block } from "@/features/site/guides";
import { pageMeta } from "@/features/site/meta";
import { SERVICES, SITE_URL, whatsappLink } from "@/features/site/content";
import { formatDate } from "@/lib/format";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) return {};
  const meta = pageMeta({ title: g.title, description: g.description, path: `/home/guides/${slug}` });
  return { ...meta, openGraph: { ...meta.openGraph, type: "article" } };
}

function renderBlock(block: Block, i: number) {
  if ("p" in block) return <p key={i}>{block.p}</p>;
  if ("list" in block)
    return (
      <ul key={i} className="list-disc space-y-2 pl-5">
        {block.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  if ("steps" in block)
    return (
      <ol key={i} className="space-y-3">
        {block.steps.map((item, n) => (
          <li key={item} className="flex gap-3">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[length:var(--text-small)] font-bold text-white">
              {n + 1}
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    );
  return (
    <p key={i} className="rounded-[var(--r-md)] border-l-4 border-[var(--sand)] bg-[var(--surface-2)] px-4 py-3 text-[var(--ink)]">
      {block.note}
    </p>
  );
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = guideBySlug(slug);
  if (!g) notFound();
  const service = SERVICES.find((s) => s.slug === g.service)!;
  const wa = whatsappLink(`Hello Dar, I read your guide "${g.title}" and have a question.`);
  const more = GUIDES.filter((x) => x.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: g.title,
          description: g.description,
          dateModified: g.checked,
          inLanguage: "en-GB",
          mainEntityOfPage: `${SITE_URL}/home/guides/${slug}`,
          author: { "@id": `${SITE_URL}/home#organization` },
          publisher: { "@id": `${SITE_URL}/home#organization` },
          image: `${SITE_URL}/og`,
        }}
      />
      <article className="pt-8 pb-4 md:pt-12">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Breadcrumbs trail={[{ name: "Guides", path: "/home/guides" }, { name: g.title, path: `/home/guides/${slug}` }]} />
            <h1 className="text-[2rem] leading-[1.12] tracking-[-0.025em] md:text-[2.75rem]">{g.title}</h1>
            <p className="mt-4 text-[1.125rem] text-[var(--ink-soft)]">{g.description}</p>
            <p className="mt-3 text-[length:var(--text-small)] text-[var(--mute)]">Checked {formatDate(g.checked)} against the sources listed below.</p>

            <section aria-label="In short" className="mt-8 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6">
              <h2 className="text-[1.125rem]">In short</h2>
              <ul className="mt-3 space-y-2">
                {g.summary.map((line) => (
                  <li key={line} className="flex gap-3">
                    <span aria-hidden className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--sand)]" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="mt-10 space-y-10 text-[1.0625rem] leading-relaxed text-[var(--ink-soft)]">
              {g.sections.map((section) => (
                <section key={section.heading} className="space-y-4">
                  <h2 className="text-[1.375rem] text-[var(--ink)] md:text-[1.5rem]">{section.heading}</h2>
                  {section.blocks.map(renderBlock)}
                </section>
              ))}
            </div>

            <section className="mt-12 rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6">
              <h2 className="text-[1.125rem]">Sources</h2>
              <ul className="mt-3 space-y-2">
                {g.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 text-[var(--accent-text)] underline underline-offset-4">
                      {s.name}
                      <ExternalLink aria-hidden size={14} className="mt-1 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[length:var(--text-small)] text-[var(--mute)]">
                Rules, fees and processes change. Check the official source before you act. This guide is general information, not legal advice.
              </p>
            </section>

            <Link href={`/home/${service.slug}`} className="mt-8 flex items-center gap-4 rounded-[var(--r-lg)] bg-[var(--accent-soft)] p-5 transition-colors hover:bg-[var(--accent-soft)]/70">
              <ServiceIcon kind={service.icon} size={48} />
              <span>
                <span className="block font-semibold text-[var(--ink)]">Rather not deal with it yourself?</span>
                <span className="block text-[var(--ink-soft)]">{service.name}: {service.short}</span>
              </span>
            </Link>

            <nav aria-label="More guides" className="mt-12">
              <h2 className="text-[1.25rem]">More guides</h2>
              <ul className="mt-4 divide-y divide-[var(--line)] overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)]">
                {more.map((m) => (
                  <li key={m.slug}>
                    <Link href={`/home/guides/${m.slug}`} className="block px-5 py-4 font-medium hover:bg-[var(--surface-2)]">
                      {m.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Container>
      </article>
      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse label="Ask us on WhatsApp" />} />
    </>
  );
}
