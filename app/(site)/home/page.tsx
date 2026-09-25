import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import Link from "next/link";
import { ArrowRight, CalendarClock, FileLock2, MessagesSquare, ShieldCheck } from "lucide-react";
import { ClosingCta, Container, FaqList, Section, Steps } from "@/features/site/components/blocks";
import { SecondaryCta, WhatsAppCta } from "@/features/site/components/cta";
import { HeroArch, ServiceIcon } from "@/features/site/components/illustrations";
import { PhoneMock } from "@/features/site/components/phone-mock";
import { COMMUNITIES, SERVICES, SITE_FAQ, whatsappLink } from "@/features/site/content";

export const metadata: Metadata = pageMeta({
  title: "Dar | Home management for Dubai villas",
  description:
    "One team that keeps your villa's documents, renewals and maintenance in hand, and deals with the vendors for you. Jumeirah Park, The Springs, The Meadows and Arabian Ranches.",
  path: "/home",
  absoluteTitle: true,
});

export default function HomePage() {
  const wa = whatsappLink("Hello Dar, I would like to know more about looking after my villa.");

  return (
    <>
      <section className="overflow-hidden border-b border-[var(--line)]">
        <Container className="grid items-end gap-8 pt-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:pt-16">
          <div className="pb-12 md:pb-20">
            <p className="mb-4 inline-flex items-center gap-2 rounded-[var(--r-full)] border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-[length:var(--text-small)] font-medium text-[var(--ink-soft)]">
              <span aria-hidden className="h-2 w-2 rounded-full bg-[var(--sand)]" />
              Villa household management in Dubai
            </p>
            <h1 className="text-[2.5rem] leading-[1.05] tracking-[-0.03em] md:text-[3.75rem]">
              Your villa, looked after.
            </h1>
            <p className="mt-5 max-w-xl text-[1.125rem] text-[var(--ink-soft)] md:text-[1.3125rem]">
              Dar is one team that keeps your home&apos;s documents, renewals and maintenance in hand, and deals
              with the vendors so you do not have to.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <WhatsAppCta href={wa} />
              <SecondaryCta href="/home/how-it-works">How it works</SecondaryCta>
            </div>
            <p className="mt-6 text-[length:var(--text-small)] text-[var(--mute)]">
              Serving {COMMUNITIES.slice(0, -1).join(", ")} and {COMMUNITIES[COMMUNITIES.length - 1]}.
            </p>
          </div>
          <HeroArch className="mx-auto -mb-1 w-full max-w-[280px] md:max-w-[480px]" />
        </Container>
      </section>

      <Section
        title="A villa is a second job"
        lead="Split AC units, a water heater, pumps, a pool, the garden, plus Ejari, DEWA, visas and school deadlines. Each on its own schedule, each with its own vendor."
      >
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {[
            [CalendarClock, "Dates slip", "Renewals and services are easy to miss until something stops working or a fine arrives."],
            [MessagesSquare, "Vendors take chasing", "Finding someone reliable, comparing quotes and following the job through takes hours."],
            [FileLock2, "Papers are everywhere", "Contracts, certificates and bills sit across inboxes, phones and drawers."],
          ].map(([Icon, title, body]) => {
            const I = Icon as typeof CalendarClock;
            return (
              <li key={title as string} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6">
                <I aria-hidden size={24} strokeWidth={1.75} className="text-[var(--accent)]" />
                <p className="mt-4 text-[1.0625rem] font-semibold">{title as string}</p>
                <p className="mt-2 text-[var(--ink-soft)]">{body as string}</p>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section
        className="bg-[var(--surface)] border-y border-[var(--line)]"
        title="What Dar takes off your hands"
        lead="Start with one service or all three. Everything runs through one team and one home file."
      >
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {SERVICES.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/home/${s.slug}`}
                className="group flex h-full flex-col rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--bg)] p-6 transition-colors hover:border-[var(--accent)] md:p-7"
              >
                <ServiceIcon kind={s.icon} />
                <h3 className="mt-5 text-[1.25rem]">{s.name}</h3>
                <p className="mt-2 flex-1 text-[var(--ink-soft)]">{s.short}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-[var(--accent-text)]">
                  Learn more
                  <ArrowRight aria-hidden size={18} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="How it works" lead="Simple for you, organised behind the scenes.">
        <Steps
          steps={[
            ["Tell us about your home", "Message us on WhatsApp. We talk through your villa and what you would like handled."],
            ["We set up your home file", "Your documents, the systems in your home and their service and expiry dates, in one private place."],
            ["We keep the calendar", "Renewals and services are tracked, and you are reminded before anything is due."],
            ["You approve, we handle it", "Send a request any time. We arrange the vendor, check the quote with you, and follow it through."],
          ]}
        />
      </Section>

      <section className="border-y border-[var(--line)] bg-[var(--surface)] py-14 md:py-20">
        <Container className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="text-[1.75rem] leading-tight tracking-[-0.02em] md:text-[2.25rem]">Your whole home, on your phone</h2>
            <p className="mt-3 text-[1.0625rem] text-[var(--ink-soft)] md:text-[1.125rem]">
              Every client gets a private home file. Open it any time to see where things stand.
            </p>
            <ul className="mt-8 space-y-5">
              {[
                ["What is due in the next 30 days", "Ejari, insurance, AC services and warranties, with a one-tap Ask Dar to handle."],
                ["Every document in one place", "Stored privately. Open, download or share it in seconds."],
                ["Every request, start to finish", "See each update from the team and reply in the same thread."],
              ].map(([t, b]) => (
                <li key={t} className="flex gap-4">
                  <span aria-hidden className="mt-1 h-6 w-6 shrink-0 rounded-full bg-[var(--accent-soft)] ring-4 ring-[var(--accent-soft)]/40" />
                  <span>
                    <span className="block font-semibold">{t}</span>
                    <span className="mt-1 block text-[var(--ink-soft)]">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <PhoneMock />
        </Container>
      </section>

      <Section title="Trust comes first">
        <ul className="grid gap-4 md:grid-cols-3 md:gap-5">
          {[
            ["Nothing booked without you", "Work that costs money is arranged only after you approve the quote or agree it with us."],
            ["Everything written down", "Every request, decision and update is recorded in your home file, so nothing depends on memory."],
            ["Your documents stay private", "Only you and the Dar team can see them. Files open through links that expire after a minute."],
          ].map(([t, b]) => (
            <li key={t} className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <ShieldCheck aria-hidden size={24} strokeWidth={1.75} className="text-[var(--accent)]" />
              <p className="mt-4 text-[1.0625rem] font-semibold">{t}</p>
              <p className="mt-2 text-[var(--ink-soft)]">{b}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Questions" className="pt-0 md:pt-0">
        <FaqList items={SITE_FAQ.slice(0, 5)} />
        <p className="mt-5">
          <Link href="/home/faq" className="font-semibold text-[var(--accent-text)] underline underline-offset-4">
            All questions and answers
          </Link>
        </p>
      </Section>

      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />}>
        <Link
          href="/home/contact"
          className="inline-flex min-h-[52px] items-center rounded-[var(--r-full)] border border-white/40 px-7 text-[1.0625rem] font-semibold text-white hover:bg-white/10"
        >
          Send an enquiry
        </Link>
      </ClosingCta>
    </>
  );
}
