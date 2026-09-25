import type { MetadataRoute } from "next";
import { SITE_URL } from "@/features/site/content";

// Crawl the website; stay out of the signed-in portal and the API.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/home", "/privacy", "/terms"],
        disallow: ["/admin", "/api", "/tasks", "/properties", "/profile", "/sign-in", "/sign-up", "/auth"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
