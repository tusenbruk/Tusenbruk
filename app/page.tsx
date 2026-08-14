import Link from "next/link";
import {
  getAllPosts,
  getFeatured,
  getNotes,
  getAllPhotos,
  getRegister,
  readingTime,
  formatDate,
  formatDateShort,
} from "@/lib/content";
import { getPlate, plateLabel } from "@/lib/plates";
import PlateLabel from "@/components/PlateLabel";
import TankSpot from "@/components/TankSpot";

export default function Home() {
  const featured = getFeatured();
  const rest = getAllPosts().filter((p) => p.slug !== featured?.slug);

  // Secondaries: up to three, each from a different plate, so the front page
  // reads across the publication rather than down one obsession.
  const secondaries: typeof rest = [];
  for (const p of rest) {
    if (secondaries.length === 3) break;
    if (p.plate !== featured?.plate && !secondaries.some((s) => s.plate === p.plate)) {
      secondaries.push(p);
    }
  }

  // The drawer: photographs with no captions and no titles. Turn one over to
  // see the catalogue card behind it; the piece is one click further.
  const usedAbove = new Set([featured?.slug, ...secondaries.map((s) => s.slug)]);
  const register = getRegister();
  const bySlug = new Map(
    register.flatMap((e) => e.posts.map((p) => [p.slug, e] as const))
  );
  const seen = new Set<string>();
  const drawer = getAllPhotos().filter((ph) => {
    if (usedAbove.has(ph.slug) || seen.has(ph.slug)) return false;
    seen.add(ph.slug);
    return true;
  });
  // Top up with lead photos of pieces already featured if the drawer runs thin.
  if (drawer.length < 4) {
    for (const ph of getAllPhotos()) {
      if (drawer.length >= 6) break;
      if (!drawer.some((d) => d.src === ph.src)) drawer.push(ph);
    }
  }

  const notes = getNotes().slice(0, 4);

  return (
    <>
      {featured && (
        <section className="lead-grid">
          <div>
            <PlateLabel plate={featured.plate} />
            <h1 className="lead-title">
              <Link href={`/writing/${featured.slug}`}>{featured.title}</Link>
            </h1>
            <p className="lead-summary">{featured.summary}</p>
            <div className="post-meta">
              {formatDate(featured.date)} · {readingTime(featured.body)} min
            </div>
          </div>
          {featured.photo && (
            <Link href={`/writing/${featured.slug}`} className="lead-art">
              <img src={featured.photo} alt={featured.photoCaption ?? featured.title} />
            </Link>
          )}
        </section>
      )}

      <hr className="hr-soft" />

      <section className="secondaries">
        {secondaries.map((p) => (
          <div key={p.slug} className="sec-card">
            {p.photo && (
              <Link href={`/writing/${p.slug}`} className="sec-thumb">
                <img src={p.photo} alt={p.title} loading="lazy" />
              </Link>
            )}
            <PlateLabel plate={p.plate} />
            <h2 className="sec-title">
              <Link href={`/writing/${p.slug}`}>{p.title}</Link>
            </h2>
            <div className="post-meta">{formatDate(p.date)}</div>
          </div>
        ))}
      </section>

      {drawer.length > 0 && (
        <>
          <hr className="hr-soft" />
          <section>
            <div className="drawer-head">
              <div className="plate red">The drawer</div>
              <div className="drawer-hint">Turn one over.</div>
            </div>
            <div className="mosaic">
              {drawer.slice(0, 8).map((ph, i) => {
                const entry = bySlug.get(ph.slug);
                const plate = entry ? getPlate(entry.plate) : undefined;
                return (
                  <Link key={`${ph.src}-${i}`} href={`/writing/${ph.slug}`} className="tile">
                    <span className="tile-inner">
                      <span className="tile-front">
                        <img src={ph.src} alt="" loading="lazy" />
                      </span>
                      <span className="tile-back">
                        <span className={`plate ${plate?.color ?? "green"}`}>
                          {entry ? plateLabel(entry.plate) : ""}
                        </span>
                        <span className="tile-obj">
                          {entry ? `Obj. ${String(entry.number).padStart(3, "0")}` : ""}
                        </span>
                        <span className="tile-name">{entry?.object}</span>
                        <span className="tile-square" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </>
      )}

      {notes.length > 0 && (
        <>
          <hr className="hr-soft" />
          <section className="notes-grid">
            <div>
              <div className="plate red">Notes</div>
              {notes.map((n) => (
                <div key={n.slug} className="note-line">
                  <span className="note-date">{formatDateShort(n.date)}</span>
                  <span>{n.body}</span>
                </div>
              ))}
            </div>
            <TankSpot />
          </section>
        </>
      )}
    </>
  );
}
