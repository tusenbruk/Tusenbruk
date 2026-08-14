import Link from "next/link";

export default function Header() {
  return (
    <header className="wrap masthead">
      <div className="mh-row">
        <Link href="/" className="mh-name">
          Tusenbruk
        </Link>
        <nav className="mh-nav">
          <Link href="/writing">Writing</Link>
          <Link href="/plates">Plates</Link>
          <Link href="/register">Register</Link>
          <Link href="/photographs">Photographs</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/notes">Notes</Link>
          <Link href="/kit">Kit</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
      <div className="mh-rule" />
    </header>
  );
}
