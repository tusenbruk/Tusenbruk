import Link from "next/link";
import type { Metadata } from "next";
import { PLATES } from "@/lib/plates";
import { getPostsByPlate } from "@/lib/content";

export const metadata: Metadata = { title: "Plates" };

export default function PlatesIndex() {
  return (
    <>
      <div className="plate red">The plates</div>
      <p className="lead-summary" style={{ marginTop: 14 }}>
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
            <p className="lead-summary" style={{ fontSize: 15 }}>{p.description}</p>
            <div className="post-meta">{count === 1 ? "1 piece" : `${count} pieces`}</div>
          </article>
        );
      })}
    </>
  );
}
