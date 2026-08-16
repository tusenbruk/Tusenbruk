import Link from "next/link";
import Image from "next/image";
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
            <span className="photo-cell-frame">
              <Image
                src={ph.src}
                alt={ph.alt}
                fill
                sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 820px) calc(50vw - 30px), 320px"
              />
            </span>
            <div className="photo-cell-caption">{ph.caption ?? ph.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
