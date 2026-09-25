import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import { CheckList, ClosingCta, PageHero, Section, Steps } from "@/features/site/components/blocks";
import { SecondaryCta, WhatsAppCta } from "@/features/site/components/cta";
import { PhoneMock } from "@/features/site/components/phone-mock";
import { whatsappLink } from "@/features/site/content";

export const metadata: Metadata = pageMeta({
  title: "How Dar works",
  description:
    "How Dar looks after your Dubai villa: we set up your private home file, keep the maintenance and renewal calendar, and handle every request with your approval.",
  path: "/home/how-it-works",
  absoluteTitle: false,
});

export default function HowItWorksPage() {
  const wa = whatsappLink("Hello Dar, I would like to know more about how it works.");
  return (
    <>
      <PageHero
        trail={[{ name: "How it works", path: "/home/how-it-works" }]}
        title="How Dar works"
        lead="One conversation to start, then one team and one private home file for everything about your villa."
        aside={<PhoneMock />}
      >
        <WhatsAppCta href={wa} />
        <SecondaryCta href="/home/faq">Questions and answers</SecondaryCta>
      </PageHero>

      <Section title="From first message to looked after">
        <Steps
          steps={[
            ["Tell us about your home", "Message us on WhatsApp or send an enquiry. We talk through your villa and what you would like handled."],
            ["We set up your home file", "Your documents, the systems in your home, access details and emergency contacts, with every service and expiry date."],
            ["We keep the calendar", "Renewals and services are tracked, and you are reminded before anything is due."],
            ["You approve, we handle it", "Send a request any time. We arrange the vendor, check the quote with you, and follow it through."],
          ]}
        />
      </Section>

      <Section title="Your private home file" lead="Open it on your phone or computer at any time." className="border-y border-[var(--line)] bg-[var(--surface)]">
        <div className="md:hidden mb-10">
          <PhoneMock />
        </div>
        <CheckList
          items={[
            ["Home screen", "Three questions answered at a glance: what is waiting on you, what is due in the next 30 days, and what Dar is handling."],
            ["Documents", "Every document in one place, opened inside the app, ready to download or share."],
            ["In the home", "Your AC units, water heater, pumps and pool, with service and warranty dates."],
            ["Requests", "Send a request in seconds, choose how urgent it is, and follow every update in one thread."],
            ["Reminders", "Emails before renewals and services are due, which you can switch off at any time."],
            ["Account", "Your details, password, help and privacy settings, all in one place."],
          ]}
        />
      </Section>

      <Section title="How we work with vendors">
        <CheckList
          items={[
            ["The right specialist for each job", "We coordinate trusted vendors rather than sending one generalist for everything."],
            ["You approve before anything is spent", "We check each quote first, and nothing that costs money is booked without your say."],
            ["Followed through", "We stay on the job until it is finished, and record it in your home file."],
            ["Only what they need", "Vendors receive the address, access and the problem to fix. Your documents stay private."],
          ]}
        />
      </Section>

      <ClosingCta whatsapp={<WhatsAppCta href={wa} inverse />} />
    </>
  );
}
