"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "./Icon";

const links = [
  ["Healthcare", "/healthcare"],
  ["Home Services", "/home-services"],
  ["How It Works", "/how-it-works"],
  ["Insights", "/insights"],
  ["About", "/about"],
  ["Support", "/help"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link href="/" className="brand" aria-label="Zuwara home">
          <Image src="/brand/zuwara-logo.png" alt="Zuwara" width={118} height={40} priority />
        </Link>
        <nav className={open ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          {links.map(([label, href]) => {
            const activePath = href.split("#")[0];
            const active = pathname === activePath || (activePath !== "/" && pathname.startsWith(activePath));
            return <Link key={href} href={href} onClick={() => setOpen(false)} className={active ? "active" : ""}>{label}</Link>;
          })}
          <div className="mobile-nav-actions">
            <Link href="/login" className="button button-secondary">Sign in</Link>
            <Link href="/#start" className="button button-primary">Get started</Link>
          </div>
        </nav>
        <div className="nav-actions">
          <Link href="/ar" className="language-link" lang="ar">العربية</Link>
          <Link href="/login" className="sign-in-link">Sign in</Link>
          <Link href="/#start" className="button button-primary button-small">Get started</Link>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Toggle navigation" aria-expanded={open}>
            <Icon name={open ? "x" : "menu"}/>
          </button>
        </div>
      </div>
    </header>
  );
}
