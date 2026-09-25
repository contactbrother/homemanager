import type { Metadata } from "next";
import { SiteHeader } from "@/features/site/components/site-header";
import { SiteFooter } from "@/features/site/components/site-footer";
import { FloatingWhatsApp } from "@/features/site/components/cta";
import { JsonLd } from "@/features/site/components/json-ld";
import { COMMUNITIES, SITE_NAME, SITE_URL, whatsappLink, whatsappNumber } from "@/features/site/content";

// The public website is indexed; the portal elsewhere keeps the root noindex.
export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const wa = whatsappLink("Hello Dar, I would like to know more about looking after my villa.");
  const number = whatsappNumber();

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--bg)]">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": `${SITE_URL}/home#organization`,
          name: SITE_NAME,
          url: `${SITE_URL}/home`,
          logo: `${SITE_URL}/icon-512.png`,
          description:
            "Household management for villas in Dubai: documents and renewals, maintenance scheduling, vendor coordination and summer home watch.",
          areaServed: COMMUNITIES.map((name) => ({ "@type": "Place", name: `${name}, Dubai` })),
          ...(number
            ? { contactPoint: { "@type": "ContactPoint", telephone: `+${number}`, contactType: "customer service", availableLanguage: ["English"] } }
            : {}),
        }}
      />
      <SiteHeader whatsapp={wa} />
      <main className="flex-1">{children}</main>
      <SiteFooter whatsapp={wa} />
      <FloatingWhatsApp href={wa} />
    </div>
  );
}
