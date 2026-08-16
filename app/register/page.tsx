import Link from "next/link";
import type { Metadata } from "next";
import { getRegister, formatDate } from "@/lib/content";
import { PLATES } from "@/lib/plates";

export const metadata: Metadata = {
  title: "Register",
  description: "Every object written about in Tusenbruk, numbered in order of first appearance.",
};

export default function RegisterPage() {
  const entries = getRegister();
  return (
    <div>
      <div className="plate red">The register</div>
      <h1 className="post-title">Objects on record</h1>
      <p className="lead-summary" style={{ marginTop: 14 }}>
        Every object that has appeared in these pages, numbered in order of first
        appearance. The register grows; it does not shrink.
      </p>
      <div className="post-rule" />
      <div className="register">
        {entries.map((e) => {
          const plate = PLATES.find((p) => p.key === e.plate);
          return (
            <div className="reg-row" key={e.number}>
              <div className="reg-no">Obj. {String(e.number).padStart(3, "0")}</div>
              <div className="reg-body">
                <div className="reg-name">{e.object}</div>
                <div className="reg-pieces">
                  {e.posts.map((p) => (
                    <Link key={p.slug} href={`/writing/${p.slug}`} className="reg-piece">
                      {p.title} <span className="reg-date">— {formatDate(p.date)}</span>
                    </Link>
                  ))}
                </div>
                {e.details && (
                  <dl className="reg-details">
                    {Object.entries(e.details).map(([label, value]) => (
                      <div key={label} className="reg-detail">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
              <div className={`plate ${plate?.color ?? "green"} reg-plate`}>
                {plate ? `Pl. ${plate.numeral} — ${plate.name}` : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
