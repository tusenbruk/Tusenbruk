import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PLATES } from "@/lib/plates";
import { getPostsByPlate } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Plates",
  description: "Six plates, the whole publication: photography, watches, motoring, writing, carry and travel.",
  path: "/plates",
});

export default function PlatesIndex() {
  return (
    <>
      <div className="plate red">The plates</div>
      <h1 className="sr-only">The plates</h1>
      <p className="lead-summary page-intro">
        Every piece carries a plate label in its category colour. Six plates; the whole publication.
      </p>
      {PLATES.map((p) => {
        const count = getPostsByPlate(p.key).length;
        return (
          <article key={p.key} className="index-item">
            <span className={`plate ${p.color}`}>Pl. {p.numeral}</span>
            <h2 className="sec-title">
              <Link href={`/plates/${p.key}`}>{p.name}</Link>
            </h2>
            <p className="lead-summary index-summary">{p.description}</p>
            <div className="post-meta">{count === 1 ? "1 piece" : `${count} pieces`}</div>
          </article>
        );
      })}
    </>
  );
}
