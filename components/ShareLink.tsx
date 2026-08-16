"use client";

import { useState } from "react";

export default function ShareLink({ title, path }: { title: string; path: string }) {
  const [label, setLabel] = useState("Share");

  async function share() {
    const url = new URL(path, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title} · Tusenbruk`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setLabel("Link copied");
      window.setTimeout(() => setLabel("Share"), 1800);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setLabel("Copy failed");
      window.setTimeout(() => setLabel("Share"), 1800);
    }
  }

  return (
    <div className="share-row">
      <button type="button" className="share-button" onClick={share}>
        {label}
      </button>
    </div>
  );
}
