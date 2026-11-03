"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Marks the current section for assistive technology. Section matching, so
// /writing/some-piece keeps "Writing" current.
export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {children}
    </Link>
  );
}
