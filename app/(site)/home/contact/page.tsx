import type { Metadata } from "next";
import { pageMeta } from "@/features/site/meta";
import { MessageCircle } from "lucide-react";
import { PageHero, Section } from "@/features/site/components/blocks";
import { COMMUNITIES, SERVICES, whatsappLink, whatsappNumber } from "@/features/site/content";
import { EnquiryForm } from "@/features/enquiries/enquiry-form";

export const metadata: Metadata = pageMeta({
  title: "Contact Dar",
  description:
    "Message Dar on WhatsApp or send an enquiry about household management for your villa in Jumeirah Park, The Springs, The Meadows or Arabian Ranches.",
  path: "/home/contact",
  absoluteTitle: false,
});

export default function ContactPage() {
  const wa = whatsappLink("Hello Dar, I would like to know more about looking after my villa.");
  const number = whatsappNumber();
  const display = number?.startsWith("971") ? `+971 ${number.slice(3, 5)} ${number.slice(5, 8)} ${number.slice(8)}` : number;

  return (
    <>
      <PageHero
        trail={[{ name: "Contact", path: "/home/contact" }]}
        title="Talk to Dar"
        lead="WhatsApp is the quickest way to reach us. Prefer to write? Send an enquiry and we will get back to you."
      />
      <Section>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-12">
          <div className="space-y-6">
            {wa ? (
              <a href={wa} className="flex items-center gap-4 rounded-[var(--r-lg)] bg-[var(--accent)] p-6 text-white transition-colors hover:bg-[var(--accent-text)]">
                <MessageCircle aria-hidden size={32} />
                <span>
                  <span className="block text-[1.125rem] font-semibold">Chat on WhatsApp</span>
                  {display ? <span className="block text-white/85">{display}</span> : null}
                </span>
              </a>
            ) : null}
            <div className="rounded-[var(--r-lg)] border border-[var(--line)] bg-[var(--surface)] p-6">
              <p className="font-semibold">Areas we serve</p>
              <ul className="mt-3 space-y-1.5 text-[var(--ink-soft)]">
                {COMMUNITIES.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <EnquiryForm communities={COMMUNITIES} services={SERVICES.map((s) => s.name)} whatsapp={wa} />
        </div>
      </Section>
    </>
  );
}
