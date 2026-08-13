import fs from "fs";
import path from "path";
import matter from "gray-matter";

export function getPage(name: string): { title: string; body: string } | undefined {
  const file = path.join(process.cwd(), "content", "pages", `${name}.md`);
  if (!fs.existsSync(file)) return undefined;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { title: data.title ?? name, body: content };
}
