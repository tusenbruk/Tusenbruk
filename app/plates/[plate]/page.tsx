import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PLATES, PlateKey, getPlate } from "@/lib/plates";
import { getPostsByPlate, readingTime, formatDate } from "@/lib/content";

export function generateStaticParams() {
  return PLATES.map((p) => ({ plate: p.key }));
}

export function generateMetadata({ params }: { params: { plate: string } }): Metadata {
  const plate = PLATES.find((p) => p.key === params.plate);
  return plate ? { title: plate.name, description: plate.description } : {};
}

export default function PlatePage({ params }: { params: { plate: string } }) {
  const plate = PLATES.find((p) => p.key === params.plate);
  if (!plate) notFound();
  const posts = getPostsByPlate(plate.key as PlateKey);

  return (
    <>
      <span className={`plate ${plate.color}`}>Pl. {plate.numeral} — {plate.name}</span>
      <p className="lead-summary" style={{ marginTop: 14 }}>{plate.description}</p>
      {posts.length === 0 && (
        <p className="lead-summary" style={{ fontStyle: "italic", color: "var(--muted)" }}>
          Nothing published under this plate yet.
        </p>
      )}
      {posts.map((p) => (
        <article key={p.slug} className="index-item">
          <h2 className="sec-title">
            <Link href={`/writing/${p.slug}`}>{p.title}</Link>
          </h2>
          {p.summary && <p className="lead-summary" style={{ fontSize: 15 }}>{p.summary}</p>}
          <div className="post-meta">
            {formatDate(p.date)} · {readingTime(p.body)} min
          </div>
        </article>
      ))}
    </>
  );
}
