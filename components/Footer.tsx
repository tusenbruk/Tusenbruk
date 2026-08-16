import Link from "next/link";

export default function Footer() {
  return (
    <footer className="wrap site-footer">
      <div className="ft-rule" />
      <div className="ft-row">
        <div>Tusenbruk · Sydney, Australia</div>
        <div className="ft-row" style={{ gap: 22 }}>
          <Link href="/writing">Writing</Link>
          <Link href="/plates">Plates</Link>
          <Link href="/register">Register</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/feed.xml">RSS</Link>
          <Link href="/about">About</Link>
          <a href="https://www.instagram.com/tusenbruk/" rel="me">
            Instagram
          </a>
          <div>Earn the wear</div>
        </div>
      </div>
    </footer>
  );
}
