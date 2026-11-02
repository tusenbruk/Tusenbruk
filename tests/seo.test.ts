import { describe, expect, it } from "vitest";
import { pageMetadata } from "@/lib/seo";

describe("pageMetadata", () => {
  it("sets canonical, og and twitter from the page's own values", () => {
    const m = pageMetadata({ title: "Register", description: "d", path: "/register" });
    expect(m.alternates?.canonical).toBe("/register");
    expect(m.openGraph).toMatchObject({ title: "Register", url: "/register", type: "website" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image", title: "Register" });
  });
  it("uses the supplied card for articles and records the publish time", () => {
    const m = pageMetadata({
      title: "T", path: "/writing/t", image: "/cards/t.jpg", type: "article", publishedTime: "2026-08-17",
    });
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-08-17" });
    expect(JSON.stringify(m.openGraph)).toContain("/cards/t.jpg");
  });
  it("falls back to the house description and image", () => {
    const m = pageMetadata({ title: "X", path: "/x" });
    expect(m.description).toMatch(/Portraits/);
    expect(JSON.stringify(m.openGraph)).toContain("/og.png");
  });
});
