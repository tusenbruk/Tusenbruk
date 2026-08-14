"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { plateLabel, getPlate, PlateKey } from "@/lib/plates";
import { formatDateShort } from "@/lib/format";

interface Line {
  slug: string;
  title: string;
  plate: PlateKey;
  date: string;
  summary: string;
}

interface BodyIndex {
  [slug: string]: string; // lowercased body text
}

export default function ArchiveList({ years }: { years: { year: string; posts: Line[] }[] }) {
  const [q, setQ] = useState("");
  const [bodies, setBodies] = useState<BodyIndex | null>(null);

  // Full-text index arrives lazily, the first time anyone actually types.
  useEffect(() => {
    if (q && !bodies) {
      fetch("/search-index.json")
        .then((r) => r.json())
        .then(setBodies)
        .catch(() => setBodies({}));
    }
  }, [q, bodies]);

  const needle = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!needle) return years;
    return years
      .map(({ year, posts }) => ({
        year,
        posts: posts.filter((p) => {
          const hay = `${p.title} ${p.summary} ${plateLabel(p.plate)}`.toLowerCase();
          if (hay.includes(needle)) return true;
          return bodies?.[p.slug]?.includes(needle) ?? false;
        }),
      }))
      .filter(({ posts }) => posts.length > 0);
  }, [years, needle, bodies]);

  const total = filtered.reduce((n, y) => n + y.posts.length, 0);

  return (
    <div>
      <div className="arch-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the archive — titles, summaries, full text"
          aria-label="Search the archive"
        />
        {needle && (
          <div className="arch-count">
            {total} {total === 1 ? "piece" : "pieces"}
          </div>
        )}
      </div>
      {filtered.map(({ year, posts }) => (
        <section key={year} className="arch-year">
          <div className="arch-year-head">{year}</div>
          {posts.map((p) => (
            <Link key={p.slug} href={`/writing/${p.slug}`} className="arch-line">
              <span className="arch-date">{formatDateShort(p.date)}</span>
              <span className={`plate ${getPlate(p.plate).color} arch-plate`}>
                Pl. {getPlate(p.plate).numeral}
              </span>
              <span className="arch-title">{p.title}</span>
            </Link>
          ))}
        </section>
      ))}
      {needle && total === 0 && (
        <p className="arch-empty">Nothing on record. The register is patient.</p>
      )}
    </div>
  );
}
