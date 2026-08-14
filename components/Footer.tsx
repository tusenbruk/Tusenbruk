import Link from "next/link";

export default function Footer() {
  return (
    <footer className="wrap site-footer">
      <div className="ft-rule" />
      <div className="ft-row">
        <div>Tusenbruk · Sydney, Australia</div>
        <div className="ft-row" style={{ gap: 22 }}>
          <Link href="/register">Register</Link>
          <Link href="/feed.xml">RSS</Link>
          <Link href="/about">About</Link>
          <div>Earn the wear</div>
        </div>
      </div>
    </footer>
  );
}
