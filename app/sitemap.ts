import type { MetadataRoute } from "next";
import { SERVICES, SITE_URL } from "@/features/site/content";
import { COMMUNITY_PAGES } from "@/features/site/communities";
import { GUIDES } from "@/features/site/guides";

// Public website only. The legal pages join once they leave DRAFT; the portal never does.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: Array<[string, number]> = [
    ["/home", 1],
    ...SERVICES.map((s): [string, number] => [`/home/${s.slug}`, 0.9]),
    ["/home/communities", 0.7],
    ...COMMUNITY_PAGES.map((c): [string, number] => [`/home/communities/${c.slug}`, 0.8]),
    ["/home/guides", 0.6],
    ...GUIDES.map((g): [string, number] => [`/home/guides/${g.slug}`, 0.6]),
    ["/home/how-it-works", 0.7],
    ["/home/faq", 0.6],
    ["/home/about", 0.5],
    ["/home/contact", 0.6],
  ];
  return pages.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority,
  }));
}
