import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import { CheckList, ClosingCta, PageHero, Section } from "@/features/site/components/blocks";
import { WhatsAppCta } from "@/features/site/components/cta";
import { COMMUNITIES, whatsappLink } from "@/features/site/content";

export const metadata: Metadata = pageMeta({
  title: "About Dar",
  description:
    "Dar means home. We are a household management service for villas in Dubai, built on trust, written records and your approval before anything is spent.",
  path: "/home/about",
  absoluteTitle: false,
});

export default function AboutPage() {
  const wa = whatsappLink("Hello Dar, I would like to know more about you.");
  return (
    <>
      <PageHero
        trail={[{ name: "About", path: "/home/about" }]}
        title="Dar means home"
        lead="We look after villas in Dubai the way a good house manager would: quietly, reliably, and with everything written down."
      />
      <Section title="Why Dar exists">
        <div className="max-w-2xl space-y-4 text-[1.0625rem] text-[var(--ink-soft)]">
          <p>
            A Dubai villa runs on dozens of moving parts: AC units, water heaters, pumps, the pool and garden, and a
            calendar of renewals from Ejari to Emirates IDs. Most families keep it all going between work, school and
            travel, with the details spread across phones and inboxes.
          </p>
          <p>
            Dar brings it into one place and one team. We keep the records, watch the dates, and handle the vendors, so
            the house simply works.
          </p>
        </div>
      </Section>
      <Section title="How we work" className="border-y border-[var(--line)] bg-[var(--surface)]">
        <CheckList
          items={[
            ["One team", "One number to message for anything about your home."],
            ["Your approval first", "Nothing that costs money is booked without your say."],
            ["Everything written down", "Every request, decision and update is recorded in your home file."],
            ["Private by default", "Your documents are seen only by you and the Dar team."],
          ]}
        />
      </Section>
      <Section title="Where we work">
        <p className="max-w-2xl text-[1.0625rem] text-[var(--ink-soft)]">
          {COMMUNITIES.slice(0, -1).join(", ")} and {COMMUNITIES[COMMUNITIES.length - 1]}. If you live nearby, message us
          and we will tell you whether we can help.
        </p>
      </Section>
      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
