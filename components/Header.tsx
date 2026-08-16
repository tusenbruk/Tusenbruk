import Link from "next/link";

export default function Header() {
  return (
    <header className="wrap masthead">
      <div className="mh-row">
        <Link href="/" className="mh-name">
          Tusenbruk
        </Link>
        <nav className="mh-nav" aria-label="Primary navigation">
          <Link href="/writing">Writing</Link>
          <Link href="/register">Register</Link>
          <Link href="/photographs">Photographs</Link>
          <Link href="/about">About</Link>
        </nav>
      </div>
      <div className="mh-rule" />
    </header>
  );
}
