import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { PlateKey, PLATE_ORDER } from "./plates";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface Post {
  slug: string;
  plate: PlateKey;
  title: string;
  date: string; // ISO yyyy-mm-dd
  summary: string;
  photo?: string; // path under /public, e.g. /photos/defender-90.jpg
  photoCaption?: string;
  place?: string; // dateline location, e.g. "Sydney, Australia"
  featured?: boolean;
  draft?: boolean;
  body: string; // markdown
}

export interface Note {
  slug: string;
  date: string;
  body: string; // short, no title
}

function toISODate(value: unknown): string {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  const d = new Date(String(value ?? ""));
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return "1970-01-01";
}

function parsePost(plate: PlateKey, filename: string): Post {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, plate, filename), "utf8");
  const { data, content } = matter(raw);
  return {
    slug: data.slug ?? filename.replace(/\.mdx?$/, ""),
    plate: (data.plate ?? plate) as PlateKey,
    title: data.title ?? "Untitled",
    date: toISODate(data.date),
    summary: data.summary ?? "",
    photo: typeof data.photo === "string" ? data.photo : undefined,
    photoCaption: typeof data.photoCaption === "string" ? data.photoCaption : undefined,
    place: typeof data.place === "string" ? data.place : undefined,
    featured: Boolean(data.featured),
    draft: Boolean(data.draft),
    body: content,
  };
}

export function getAllPosts(): Post[] {
  const all: Post[] = [];
  for (const plate of PLATE_ORDER) {
    const dir = path.join(CONTENT_DIR, plate);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.mdx?$/.test(file)) continue;
      const post = parsePost(plate, file);
      if (!post.draft) all.push(post);
    }
  }
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostsByPlate(plate: PlateKey): Post[] {
  return getAllPosts().filter((p) => p.plate === plate);
}

export function getPost(slug: string): Post | undefined {
  return getAllPosts().find((p) => p.slug === slug);
}

export function getFeatured(): Post | undefined {
  const all = getAllPosts();
  return all.find((p) => p.featured) ?? all[0];
}

export function getNotes(): Note[] {
  const dir = path.join(CONTENT_DIR, "notes");
  if (!fs.existsSync(dir)) return [];
  const notes: Note[] = [];
  for (const file of fs.readdirSync(dir)) {
    if (!/\.mdx?$/.test(file)) continue;
    const raw = fs.readFileSync(path.join(dir, file), "utf8");
    const { data, content } = matter(raw);
    notes.push({
      slug: file.replace(/\.mdx?$/, ""),
      date: toISODate(data.date),
      body: content.trim(),
    });
  }
  return notes.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function readingTime(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).length / 220));
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }).toUpperCase().replace(".", "");
}
