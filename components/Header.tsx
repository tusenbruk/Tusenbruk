import Link from "next/link";
import NavLink from "./NavLink";

export default function Header() {
  return (
    <header className="wrap masthead">
      <div className="mh-row">
        <Link href="/" className="mh-name">
          Tusenbruk
        </Link>
        <nav className="mh-nav" aria-label="Primary navigation">
          <NavLink href="/writing">Writing</NavLink>
          <NavLink href="/register">Register</NavLink>
          <NavLink href="/photographs">Photographs</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>
      </div>
      <div className="mh-rule" />
    </header>
  );
}
