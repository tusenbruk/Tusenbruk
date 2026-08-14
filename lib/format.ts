// Pure formatting helpers — safe to import from client components.
export function readingTime(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).length / 220));
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-AU", { day: "2-digit", month: "short" }).toUpperCase().replace(".", "");
}
