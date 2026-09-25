import type { Metadata } from "next";
import { SITE_NAME } from "./content";

const IMAGE = { url: "/og", width: 1200, height: 630, alt: "Dar, home management for Dubai villas" };

/** Title, description, canonical and share cards for a website page, in one place. */
export function pageMeta({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const full = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: full, description, url: path, siteName: SITE_NAME, locale: "en_GB", type: "website", images: [IMAGE] },
    twitter: { card: "summary_large_image", title: full, description, images: [IMAGE.url] },
  };
}
