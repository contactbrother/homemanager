import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import { ClosingCta, FaqList, PageHero, Section } from "@/features/site/components/blocks";
import { WhatsAppCta } from "@/features/site/components/cta";
import { SITE_FAQ, whatsappLink } from "@/features/site/content";
import { SERVICE_DETAILS } from "@/features/site/service-details";

export const metadata: Metadata = pageMeta({
  title: "Questions and answers",
  description:
    "Answers about Dar's villa household management in Dubai: what we do, the areas we cover, approvals, privacy and home watch.",
  path: "/home/faq",
  absoluteTitle: false,
});

export default function FaqPage() {
  const wa = whatsappLink("Hello Dar, I have a question.");
  const seen = new Set(SITE_FAQ.map(([q]) => q));
  const more = Object.values(SERVICE_DETAILS)
    .flatMap((d) => d.faq)
    .filter(([q]) => (seen.has(q) ? false : (seen.add(q), true)));
  return (
    <>
      <PageHero trail={[{ name: "FAQ", path: "/home/faq" }]} title="Questions and answers" lead="If yours is not here, message us. We reply on WhatsApp." />
      <Section>
        <FaqList items={[...SITE_FAQ, ...more]} />
      </Section>
      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse label="Ask on WhatsApp" />} />
    </>
  );
}
