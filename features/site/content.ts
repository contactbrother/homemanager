/**
 * Website content in one place. Every claim here is something Dar does today; no
 * prices, visit frequencies, response times, client numbers or testimonials until
 * they are confirmed. Communities are the areas served, not offices.
 */

export const SITE_URL = "https://homemanager.ansy.in";
export const SITE_NAME = "Dar";

export function whatsappNumber(): string | null {
  return process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "") || null;
}

export function whatsappLink(text?: string): string | null {
  const n = whatsappNumber();
  if (!n) return null;
  return text ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : `https://wa.me/${n}`;
}

export const COMMUNITIES = ["Jumeirah Park", "The Springs", "The Meadows", "Arabian Ranches"] as const;

export interface Service {
  slug: string;
  name: string;
  short: string;
  title: string;
  description: string;
  icon: "house" | "documents" | "watch";
}

export const SERVICES: Service[] = [
  {
    slug: "house-management",
    name: "House management",
    short: "Maintenance scheduled, vendors coordinated, quotes checked. One team for everything your villa needs.",
    title: "Villa house management in Dubai",
    description:
      "Dar schedules your villa's maintenance, coordinates the vendors, checks quotes and follows every job through, across Jumeirah Park, The Springs, The Meadows and Arabian Ranches.",
    icon: "house",
  },
  {
    slug: "documents-and-renewals",
    name: "Documents and renewals",
    short: "Ejari, visas, Emirates IDs, car registration and school deadlines, tracked and flagged before they lapse.",
    title: "Home document and renewal management in Dubai",
    description:
      "Keep your family's and your home's documents in one private place. Dar tracks Ejari, visas, Emirates IDs, passports, car registration and school deadlines, and reminds you before anything lapses.",
    icon: "documents",
  },
  {
    slug: "home-watch",
    name: "Summer home watch",
    short: "Inspections of your empty villa through the summer, with a photo report after every visit.",
    title: "Summer home watch for Dubai villas",
    description:
      "Travelling for the summer? Dar inspects your empty villa from June to August, sends a photo report after every visit, and deals with anything that needs fixing before you are back.",
    icon: "watch",
  },
];

export const SITE_FAQ: Array<[string, string]> = [
  [
    "What is Dar?",
    "Dar is a household management service for villas in Dubai. We keep your home's records, track every renewal, schedule maintenance and deal with the vendors, so there is one team to call for everything about your home.",
  ],
  [
    "Is Dar a maintenance company?",
    "No. We do not send our own technicians. We choose and coordinate trusted vendors, check their quotes, and follow each job through until it is done properly.",
  ],
  [
    "Which communities do you cover?",
    "Jumeirah Park, The Springs, The Meadows and Arabian Ranches. If you are nearby, message us and we will tell you whether we can help.",
  ],
  [
    "Will anything be booked without my say?",
    "No. Work that costs money is arranged only after you approve the quote or agree it with us.",
  ],
  [
    "How do I keep track of what is happening?",
    "Every client gets a private online home file. It shows what is due in the next 30 days, holds your documents, and records every request with its full history.",
  ],
  [
    "Who can see my documents?",
    "Only you and the Dar team. Files are stored privately and open through links that expire after a minute.",
  ],
  [
    "Can you look after my villa while I travel?",
    "Yes. Our summer home watch covers June to August, with an inspection and photo report after every visit, and we arrange any fix that is needed.",
  ],
  [
    "How much does it cost?",
    "It depends on your home and what you would like us to handle. Message us on WhatsApp and we will talk it through.",
  ],
];
