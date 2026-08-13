import type { Metadata } from "next";
import { getNotes, formatDate } from "@/lib/content";

export const metadata: Metadata = { title: "Notes" };

export default function NotesPage() {
  const notes = getNotes();
  return (
    <>
      <div className="plate red">Notes</div>
      <p className="lead-summary" style={{ marginTop: 14 }}>
        Short observations, dated, no titles.
      </p>
      {notes.length === 0 && (
        <p className="lead-summary" style={{ fontStyle: "italic", color: "var(--muted)" }}>
          Nothing yet.
        </p>
      )}
      {notes.map((n) => (
        <div key={n.slug} className="index-item">
          <div className="post-meta" style={{ marginTop: 0 }}>{formatDate(n.date)}</div>
          <p className="lead-summary" style={{ marginTop: 8 }}>{n.body}</p>
        </div>
      ))}
    </>
  );
}
