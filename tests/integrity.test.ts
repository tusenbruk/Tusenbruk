import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getAllPosts, getNotes } from "@/lib/content";
import { PLATES } from "@/lib/plates";

const root = process.cwd();
const posts = getAllPosts();
const slugs = new Set(posts.map((p) => p.slug));
const staticRoutes = new Set(["/", "/writing", "/plates", "/register", "/photographs", "/archive", "/notes", "/about", "/feed.xml"]);

// Every internal markdown link and image in published prose must resolve:
// to a real piece, plate or page, or to a real file under /public.
describe("internal links and assets", () => {
  const texts = [...posts.map((p) => ({ id: p.slug, text: p.body })), ...getNotes().map((n) => ({ id: n.slug, text: n.body }))];

  it("resolves every internal link", () => {
    const broken: string[] = [];
    for (const { id, text } of texts) {
      for (const m of text.matchAll(/(?<!!)\[[^\]]*\]\((\/[^)\s#]*)/g)) {
        const href = m[1];
        const ok =
          staticRoutes.has(href) ||
          (href.startsWith("/writing/") && slugs.has(href.slice("/writing/".length))) ||
          (href.startsWith("/plates/") && PLATES.some((p) => p.key === href.slice("/plates/".length)));
        if (!ok) broken.push(`${id}: ${href}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it("finds every referenced image, card and lead photograph on disk", () => {
    const missing: string[] = [];
    const check = (id: string, asset?: string) => {
      if (asset?.startsWith("/") && !fs.existsSync(path.join(root, "public", asset))) missing.push(`${id}: ${asset}`);
    };
    for (const p of posts) {
      check(p.slug, p.photo);
      for (const m of p.body.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)\)/g)) check(p.slug, m[1]);
    }
    expect(missing).toEqual([]);
  });

  it("has a share card for every published piece", () => {
    const missing = posts.filter((p) => !fs.existsSync(path.join(root, "public", "cards", `${p.slug}.jpg`)));
    expect(missing.map((p) => p.slug)).toEqual([]);
  });
});
