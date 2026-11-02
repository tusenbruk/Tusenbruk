import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import { GET as feed } from "@/app/feed.xml/route";
import { getAllPosts } from "@/lib/content";
import { PLATES } from "@/lib/plates";

describe("sitemap and robots", () => {
  const urls = sitemap().map((e) => e.url);
  it("lists every piece, every plate and the main sections exactly once", () => {
    for (const p of getAllPosts()) expect(urls).toContain(`https://tusenbruk.com/writing/${p.slug}`);
    for (const p of PLATES) expect(urls).toContain(`https://tusenbruk.com/plates/${p.key}`);
    for (const s of ["/register", "/archive", "/photographs", "/notes", "/about"]) {
      expect(urls).toContain(`https://tusenbruk.com${s}`);
    }
    expect(new Set(urls).size).toBe(urls.length);
  });
  it("points robots at the sitemap and allows crawling", () => {
    const r = robots();
    expect(r.sitemap).toBe("https://tusenbruk.com/sitemap.xml");
    expect(JSON.stringify(r.rules)).toContain("allow");
  });
});

describe("rss feed", () => {
  it("is well-formed RSS with a self link and escaped text", async () => {
    const res = feed();
    expect(res.headers.get("Content-Type")).toContain("application/rss+xml");
    const xml = await res.text();
    expect(xml).toContain('rel="self"');
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;)/); // no bare ampersands
    expect((xml.match(/<item>/g) ?? []).length).toBe(Math.min(20, getAllPosts().length));
  });
});
