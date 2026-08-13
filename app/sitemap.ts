import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";
import { PLATES } from "@/lib/plates";

const BASE = "https://tusenbruk.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts().map((p) => ({
    url: `${BASE}/writing/${p.slug}`,
    lastModified: p.date,
  }));
  const plates = PLATES.map((p) => ({ url: `${BASE}/plates/${p.key}` }));
  return [
    { url: BASE },
    { url: `${BASE}/writing` },
    { url: `${BASE}/plates` },
    { url: `${BASE}/notes` },
    { url: `${BASE}/kit` },
    { url: `${BASE}/about` },
    ...plates,
    ...posts,
  ];
}
