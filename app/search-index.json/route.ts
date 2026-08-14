import { getAllPosts } from "@/lib/content";

export const dynamic = "force-static";

// Slug → lowercased body text, for the archive's full-text search.
export function GET() {
  const index: Record<string, string> = {};
  for (const p of getAllPosts()) {
    index[p.slug] = p.body
      .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
      .replace(/[#*_>|`\[\]]/g, " ")
      .replace(/\s+/g, " ")
      .toLowerCase();
  }
  return Response.json(index);
}
