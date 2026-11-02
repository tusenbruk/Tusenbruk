import type { Metadata } from "next";
import { getArchive } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import ArchiveList from "@/components/ArchiveList";

export const metadata: Metadata = pageMetadata({
  title: "Archive",
  description: "Everything, in order. One line per piece.",
  path: "/archive",
});

export default function ArchivePage() {
  const years = getArchive().map(({ year, posts }) => ({
    year,
    posts: posts.map((p) => ({
      slug: p.slug,
      title: p.title,
      plate: p.plate,
      date: p.date,
      summary: p.summary,
    })),
  }));
  return (
    <div>
      <div className="plate red">The archive</div>
      <h1 className="post-title">Everything, in order</h1>
      <div className="post-rule" />
      <ArchiveList years={years} />
    </div>
  );
}
