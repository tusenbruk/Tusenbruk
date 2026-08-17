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
  subject?: string; // named, initialled or descriptive; required for published portraits
  object?: string; // catalogue name, e.g. "Leica Q2" — groups pieces in the register
  // portrait: one person's use of one object. field-note: a witnessed, observational scene.
  // study: an ownerless object history — draft-only, never published (see the constitution).
  // essay: an argument grounded in real, referenced examples — no single subject or object;
  // excluded from the Register, which catalogues objects, not arguments.
  kind: "portrait" | "field-note" | "study" | "essay";
  photo?: string; // path under /public, e.g. /photos/defender-90.jpg
  photoAlt?: string;
  photoCaption?: string;
  details?: Record<string, string>; // technical record shown in /register, never in article prose
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
    subject: typeof data.subject === "string" ? data.subject : undefined,
    object: typeof data.object === "string" ? data.object : undefined,
    kind:
      data.kind === "field-note"
        ? "field-note"
        : data.kind === "study"
          ? "study"
          : data.kind === "essay"
            ? "essay"
            : "portrait",
    photo: typeof data.photo === "string" ? data.photo : undefined,
    photoAlt: typeof data.photoAlt === "string" ? data.photoAlt : undefined,
    photoCaption: typeof data.photoCaption === "string" ? data.photoCaption : undefined,
    details:
      data.details && typeof data.details === "object"
        ? Object.fromEntries(Object.entries(data.details).map(([key, value]) => [key, String(value)]))
        : undefined,
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

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
  slug: string; // post it belongs to
  title: string;
  date: string;
}

// Every photograph on the site: each post's lead photo plus any images in the body.
export function getAllPhotos(): Photo[] {
  const photos: Photo[] = [];
  for (const p of getAllPosts()) {
    if (p.photo) {
      photos.push({
        src: p.photo,
        alt: p.photoAlt ?? p.title,
        caption: p.photoCaption,
        slug: p.slug,
        title: p.title,
        date: p.date,
      });
    }
    const re = /!\[([^\]]*)\]\(([^)\s]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(p.body))) {
      if (m[2] !== p.photo) {
        photos.push({
          src: m[2],
          alt: m[1] || p.title,
          caption: m[1] || undefined,
          slug: p.slug,
          title: p.title,
          date: p.date,
        });
      }
    }
  }
  return photos;
}

export interface RegisterEntry {
  number: number; // Obj. 001 …
  object: string;
  plate: PlateKey;
  posts: Post[]; // newest first
  firstDate: string;
  details?: Record<string, string>;
}

// The register: every object written about, numbered in order of first appearance.
// Essays argue across objects rather than catalogue one, so they don't enter it.
export function getRegister(): RegisterEntry[] {
  const byObject = new Map<string, Post[]>();
  for (const p of getAllPosts()) {
    if (p.kind === "essay") continue;
    const key = p.object ?? p.title;
    byObject.set(key, [...(byObject.get(key) ?? []), p]);
  }
  const entries = [...byObject.entries()].map(([object, posts]) => ({
    object,
    posts,
    plate: posts[0].plate,
    firstDate: posts[posts.length - 1].date,
    details: posts.find((post) => post.details)?.details,
  }));
  entries.sort((a, b) => (a.firstDate < b.firstDate ? -1 : 1));
  return entries.map((e, i) => ({ ...e, number: i + 1 }));
}

// Posts grouped by year, newest year first, for the archive.
export function getArchive(): { year: string; posts: Post[] }[] {
  const byYear = new Map<string, Post[]>();
  for (const p of getAllPosts()) {
    const y = p.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), p]);
  }
  return [...byYear.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([year, posts]) => ({ year, posts }));
}

export { readingTime, formatDate, formatDateShort } from "./format";
