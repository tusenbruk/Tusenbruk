import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, readingTime, formatDate } from "@/lib/content";
import PlateLabel from "@/components/PlateLabel";

export const metadata: Metadata = { title: "Writing" };

export default function WritingIndex() {
  const posts = getAllPosts();
  return (
    <>
      <h1 className="sr-only">Writing</h1>
      <div className="plate red" aria-hidden="true">Index</div>
      {posts.map((p) => (
        <article key={p.slug} className="index-item">
          <PlateLabel plate={p.plate} />
          <h2 className="sec-title">
            <Link href={`/writing/${p.slug}`}>{p.title}</Link>
          </h2>
          {p.summary && <p className="lead-summary index-summary">{p.summary}</p>}
          <div className="post-meta">
            {formatDate(p.date)} · {readingTime(p.body)} min
          </div>
        </article>
      ))}
    </>
  );
}
