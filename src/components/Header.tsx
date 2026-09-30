"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

const links = [
  ["Healthcare", "/healthcare"],
  ["Home Services", "/home-services"],
  ["How It Works", "/how-it-works"],
  ["Insights", "/insights"],
  ["About", "/about"],
  ["Support", "/help"],
];

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
    </svg>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const isArabic = pathname === "/ar" || pathname.startsWith("/ar/");
  const langHref = isArabic ? pathname.replace(/^\/ar/, "") || "/" : "/ar";

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close the menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close the menu if the screen grows into the desktop layout
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1101px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <header className={styles.header}>
      {/* Dimmed page behind the open mobile menu; tap to close */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropOpen : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div className={`container ${styles.wrap}`}>
        <Link href="/" className={styles.brand} aria-label="Zuwara home" onClick={() => setOpen(false)}>
          <Image src="/brand/zuwara-logo.png" alt="Zuwara" width={118} height={40} priority />
        </Link>

        <nav id="main-nav" className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Main navigation">
          {/* Drawer header: title and close button (mobile menu only) */}
          <div className={styles.menuHead}>
            <p className={styles.menuTitle} aria-hidden="true">Menu</p>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label="Close navigation">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {links.map(([label, href], index) => {
            const activePath = href.split("#")[0];
            const active = pathname === activePath || (activePath !== "/" && pathname.startsWith(activePath));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={active ? styles.active : ""}
                aria-current={active ? "page" : undefined}
                style={{ "--i": index } as CSSProperties}
              >
                {label}
              </Link>
            );
          })}

          {/* Inside the mobile menu only */}
          <div className={styles.mobileActions}>
            <Link href="/#start" className={styles.mobileCta} onClick={() => setOpen(false)}>
              Book an Appointment
            </Link>
            <Link href="/login" className={styles.mobileSignIn} onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link
              href={langHref}
              className={styles.mobileLang}
              lang={isArabic ? "en" : "ar"}
              hrefLang={isArabic ? "en" : "ar"}
              onClick={() => setOpen(false)}
            >
              <GlobeIcon />
              <span>{isArabic ? "English" : "العربية"}</span>
            </Link>
          </div>
        </nav>

        <div className={styles.actions}>
          {/* In the top bar on desktop and tablet, hidden on phones (it is in the menu there) */}
          <Link
            href={langHref}
            className={styles.langPill}
            lang={isArabic ? "en" : "ar"}
            hrefLang={isArabic ? "en" : "ar"}
            aria-label={isArabic ? "Switch to English" : "التبديل إلى العربية"}
            onClick={() => setOpen(false)}
          >
            <GlobeIcon />
            <span>{isArabic ? "EN" : "العربية"}</span>
          </Link>

          <Link href="/#start" className={styles.cta}>Book an Appointment</Link>

          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="main-nav"
          >
            <Icon name={open ? "x" : "menu"} />
          </button>
        </div>
      </div>
    </header>
  );
}