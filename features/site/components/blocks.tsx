import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./json-ld";
import { SITE_URL } from "@/features/site/content";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-6xl px-5 md:px-8 ${className}`}>{children}</div>;
}

export function Section({
  title,
  lead,
  children,
  className = "",
  id,
}: {
  title?: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-14 md:py-20 ${className}`}>
      <Container>
        {title ? (
          <div className="mb-8 max-w-2xl md:mb-12">
            <h2 className="text-[1.75rem] leading-tight tracking-[-0.02em] md:text-[2.25rem]">{title}</h2>
            {lead ? <p className="mt-3 text-[1.0625rem] text-[var(--ink-soft)] md:text-[1.125rem]">{lead}</p> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

/** Breadcrumbs, shown and described to search engines. */
export function Breadcrumbs({ trail }: { trail: Array<{ name: string; path: string }> }) {
  const items = [{ name: "Home", path: "/home" }, ...trail];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${SITE_URL}${item.path}`,
          })),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-5">
        <ol className="flex flex-wrap items-center gap-1 text-[length:var(--text-small)] text-[var(--mute)]">
          {items.map((item, i) => (
            <li key={item.path} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight aria-hidden size={14} /> : null}
              {i < items.length - 1 ? (
                <Link href={item.path} className="hover:text-[var(--ink)]">
                  {item.name}
                </Link>
              ) : (
                <span aria-current="page" className="text-[var(--ink-soft)]">
                  {item.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

export function PageHero({
  trail,
  title,
  lead,
  children,
  aside,
}: {
  trail: Array<{ name: string; path: string }>;
  title: string;
  lead: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--line)] pt-8 pb-12 md:pt-12 md:pb-16">
      <Container className={aside ? "grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]" : ""}>
        <div className="max-w-2xl">
          <Breadcrumbs trail={trail} />
          <h1 className="text-[2.125rem] leading-[1.1] tracking-[-0.025em] md:text-[3rem]">{title}</h1>
          <p className="mt-4 text-[1.125rem] text-[var(--ink-soft)] md:text-[1.25rem]">{lead}</p>
          {children ? <div className="mt-8 flex flex-wrap gap-3">{children}</div> : null}
        </div>
        {aside ? <div className="hidden md:block">{aside}</div> : null}
      </Container>
    </section>
  );
}

export function CheckList({ items }: { items: Array<[string, string]> }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
      {items.map(([title, body]) => (
        <li key={title} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 md:p-6">
          <p className="flex items-start gap-3 font-semibold">
            <span aria-hidden className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--sand)]" />
            {title}
          </p>
          <p className="mt-2 pl-[22px] text-[var(--ink-soft)]">{body}</p>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps }: { steps: Array<[string, string]> }) {
  return (
    <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 md:gap-5">
      {steps.map(([title, body], i) => (
        <li key={title} className="rounded-[var(--r-lg)] bg-[var(--surface)] p-5 border border-[var(--line)] md:p-6">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-white">
            {i + 1}
          </span>
          <p className="mt-4 font-semibold text-[1.0625rem]">{title}</p>
          <p className="mt-2 text-[var(--ink-soft)]">{body}</p>
        </li>
      ))}
    </ol>
  );
}

export function FaqList({ items }: { items: Array<[string, string]> }) {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map(([q, a]) => ({
            "@type": "Question",
            name: q,
            acceptedAnswer: { "@type": "Answer", text: a },
          })),
        }}
      />
      <div className="divide-y divide-[var(--line)] overflow-hidden rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)]">
        {items.map(([q, a]) => (
          <details key={q} className="group px-5 md:px-6">
            <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold [&::-webkit-details-marker]:hidden">
              {q}
              <span aria-hidden className="shrink-0 text-[1.5rem] leading-none text-[var(--mute)] transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="pb-5 text-[var(--ink-soft)]">{a}</p>
          </details>
        ))}
      </div>
    </>
  );
}

/** The closing band on every page. */
export function ClosingCta({ whatsapp, children }: { whatsapp: React.ReactNode; children?: React.ReactNode }) {
  return (
    <section className="py-14 md:py-20">
      <Container>
        <div className="relative overflow-hidden rounded-[24px] bg-[var(--accent)] px-6 py-12 text-white md:px-12 md:py-16">
          <svg aria-hidden viewBox="0 0 200 220" className="pointer-events-none absolute -right-8 -bottom-10 w-[220px] opacity-25 md:w-[300px]">
            <path d="M10 220V110a90 90 0 0 1 180 0v110z" fill="none" stroke="var(--sand)" strokeWidth="3" />
            <path d="M55 220V120a45 45 0 0 1 90 0v100z" fill="var(--sand)" />
          </svg>
          <h2 className="relative max-w-xl text-[1.75rem] leading-tight tracking-[-0.02em] text-white md:text-[2.25rem]">
            Tell us about your home.
          </h2>
          <p className="relative mt-3 max-w-lg text-[1.0625rem] text-white/85">
            A short message is enough. We will reply on WhatsApp and talk through what you would like us to take off your hands.
          </p>
          <div className="relative mt-8 flex flex-wrap gap-3">
            {whatsapp}
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}
