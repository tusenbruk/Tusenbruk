import Link from "next/link";
import type { Metadata } from "next";
import { getAllPhotos } from "@/lib/content";

export const metadata: Metadata = {
  title: "Photographs",
  description: "Every photograph on the site. Objects in use, or after use. Never on white.",
};

export default function PhotographsPage() {
  const photos = getAllPhotos();
  return (
    <div>
      <div className="plate red">The wall</div>
      <h1 className="post-title">Photographs</h1>
      <p className="lead-summary" style={{ marginTop: 14 }}>
        Objects in use, or after use. Never on white. The scratch is visible.
      </p>
      <div className="post-rule" />
      <div className="photo-grid">
        {photos.map((ph, i) => (
          <Link key={`${ph.src}-${i}`} href={`/writing/${ph.slug}`} className="photo-cell">
            <img src={ph.src} alt={ph.caption ?? ph.title} loading="lazy" />
            <div className="photo-cell-caption">{ph.caption ?? ph.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
