import Link from "next/link";
import { getAllPosts, getFeatured, getNotes, readingTime, formatDate, formatDateShort } from "@/lib/content";
import PlateLabel from "@/components/PlateLabel";

export default function Home() {
  const featured = getFeatured();
  const rest = getAllPosts().filter((p) => p.slug !== featured?.slug);
  const secondaries = rest.slice(0, 2);
  const notes = getNotes().slice(0, 4);

  return (
    <>
      {featured && (
        <section>
          <PlateLabel plate={featured.plate} />
          <h1 className="lead-title">
            <Link href={`/writing/${featured.slug}`}>{featured.title}</Link>
          </h1>
          <p className="lead-summary">{featured.summary}</p>
          <div className="post-meta">
            {formatDate(featured.date)} · {readingTime(featured.body)} min
          </div>
        </section>
      )}

      <hr className="hr-soft" />

      <section className="secondaries">
        {secondaries.map((p) => (
          <div key={p.slug}>
            <PlateLabel plate={p.plate} />
            <h2 className="sec-title">
              <Link href={`/writing/${p.slug}`}>{p.title}</Link>
            </h2>
            <div className="post-meta">{formatDate(p.date)}</div>
          </div>
        ))}
      </section>

      {notes.length > 0 && (
        <>
          <hr className="hr-soft" />
          <section>
            <div className="plate red">Notes</div>
            {notes.map((n) => (
              <div key={n.slug} className="note-line">
                <span className="note-date">{formatDateShort(n.date)}</span>
                <span>{n.body}</span>
              </div>
            ))}
          </section>
        </>
      )}
    </>
  );
}
