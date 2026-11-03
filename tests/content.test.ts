import { describe, expect, it } from "vitest";
import { getAllPhotos, getArchive, getFeatured, getAllPosts, getPost, getRegister } from "@/lib/content";
import { PLATES } from "@/lib/plates";

const posts = getAllPosts();

describe("published content", () => {
  it("has no drafts and unique slugs", () => {
    expect(posts.length).toBeGreaterThan(0);
    expect(posts.every((p) => !p.draft)).toBe(true);
    expect(new Set(posts.map((p) => p.slug)).size).toBe(posts.length);
  });
  it("is sorted newest first", () => {
    const dates = posts.map((p) => p.date);
    expect(dates).toEqual([...dates].sort().reverse());
  });
  it("puts every post on a known plate", () => {
    const keys = PLATES.map((p) => p.key);
    expect(posts.every((p) => keys.includes(p.plate))).toBe(true);
  });
  it("has exactly one featured portrait", () => {
    const featured = posts.filter((p) => p.featured);
    expect(featured).toHaveLength(1);
    expect(featured[0].kind).toBe("portrait");
    expect(getFeatured()?.slug).toBe(featured[0].slug);
  });
  it("never publishes ownerless studies; portraits carry a subject", () => {
    expect(posts.some((p) => p.kind === "study")).toBe(false);
    expect(posts.filter((p) => p.kind === "portrait").every((p) => !!p.subject)).toBe(true);
  });
  it("requires alt text wherever a lead photograph exists", () => {
    expect(posts.filter((p) => p.photo).every((p) => !!p.photoAlt)).toBe(true);
  });
  it("looks posts up by slug", () => {
    expect(getPost(posts[0].slug)?.title).toBe(posts[0].title);
    expect(getPost("no-such-slug")).toBeUndefined();
  });
});

describe("register", () => {
  const register = getRegister();
  it("numbers objects from 1 in order of first appearance", () => {
    expect(register.map((e) => e.number)).toEqual(register.map((_, i) => i + 1));
    const first = register.map((e) => e.firstDate);
    expect(first).toEqual([...first].sort());
  });
  it("excludes essays, which argue rather than catalogue", () => {
    const essays = posts.filter((p) => p.kind === "essay").map((p) => p.slug);
    const listed = register.flatMap((e) => e.posts.map((p) => p.slug));
    expect(essays.some((s) => listed.includes(s))).toBe(false);
  });
});

describe("archive and photographs", () => {
  it("groups every post by year, newest year first", () => {
    const archive = getArchive();
    expect(archive.flatMap((y) => y.posts)).toHaveLength(posts.length);
    const years = archive.map((y) => y.year);
    expect(years).toEqual([...years].sort().reverse());
  });
  it("gives every photograph its post's slug and plate", () => {
    for (const ph of getAllPhotos()) {
      const post = getPost(ph.slug);
      expect(post?.plate).toBe(ph.plate);
      expect(ph.alt.length).toBeGreaterThan(0);
    }
  });
});
