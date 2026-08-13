import Link from "next/link";

export default function NotFound() {
  return (
    <div className="post" style={{ paddingTop: 40 }}>
      <div className="plate red">Missing plate</div>
      <h1 className="post-title">This page has gone missing.</h1>
      <div className="post-rule" />
      <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.68 }}>
        Perhaps it wore out. Perhaps it was never made.{" "}
        <Link href="/" style={{ color: "var(--specimen-red)" }}>
          Back to the front page
        </Link>
        .
      </p>
    </div>
  );
}
