import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "./site";

interface PageMeta {
  title: string;
  description?: string;
  path: string; // site-relative, e.g. "/register"
  image?: string; // site-relative; defaults to the house card
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
}

// Next merges metadata shallowly: a page that sets `openGraph` replaces the
// layout's object entirely, and a page that sets none inherits the home page's
// og:title and og:url. Building the complete set per page keeps canonical,
// Open Graph and Twitter tags correct everywhere.
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = "website",
  publishedTime,
}: PageMeta): Metadata {
  const alt = imageAlt ?? `${SITE_NAME} — ${title}`;
  const images = [{ url: image, width: 1200, height: 630, alt }];
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: SITE_NAME,
      locale: "en_AU",
      images,
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image, alt }] },
  };
}
