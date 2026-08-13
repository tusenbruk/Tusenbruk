import { getAllPosts } from "@/lib/content";

export const dynamic = "force-static";

const BASE = "https://tusenbruk.com";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function GET() {
  const posts = getAllPosts().slice(0, 20);
  const items = posts
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${BASE}/writing/${p.slug}</link>
      <guid>${BASE}/writing/${p.slug}</guid>
      <pubDate>${new Date(p.date + "T00:00:00Z").toUTCString()}</pubDate>
      <description>${esc(p.summary)}</description>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tusenbruk</title>
    <link>${BASE}</link>
    <description>A publication about the relationship between a person and the objects they use. Not reviews. Portraits.</description>
    <language>en</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
