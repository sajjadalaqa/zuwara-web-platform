"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { Icon } from "./Icon";
import styles from "./Header.module.css";

const links = [
  ["home", "/"],
  ["services", "/home-services"],
  ["categories", "/category"],
  ["blogs", "/blog"],
  ["provider", "/provider"],
  ["contact", "/contact"],
] as const;

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
  const t = useTranslations("Header");
  const locale = useLocale();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const pathname = usePathname(); // already without the "/ar" prefix
  const [open, setOpen] = useState(false);

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
        <Link href="/" className={styles.brand} aria-label={t("homeAria")} onClick={() => setOpen(false)}>
          <Image src="/brand/zuwara-logo.png" alt="Zuwara" width={118} height={40} priority />
        </Link>

        <nav id="main-nav" className={`${styles.nav} ${open ? styles.navOpen : ""}`} aria-label="Main navigation">
          {/* Drawer header: title and close button (mobile menu only) */}
          <div className={styles.menuHead}>
            <p className={styles.menuTitle} aria-hidden="true">{t("menu")}</p>
            <button type="button" className={styles.closeBtn} onClick={() => setOpen(false)} aria-label={t("closeNav")}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" focusable="false">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          {links.map(([key, href], index) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={active ? styles.active : ""}
                aria-current={active ? "page" : undefined}
                style={{ "--i": index } as CSSProperties}
              >
                {t(`nav.${key}`)}
              </Link>
            );
          })}

          {/* Inside the mobile menu only */}
          <div className={styles.mobileActions}>
            <Link href="/#start" className={styles.mobileCta} onClick={() => setOpen(false)}>
              {t("book")}
            </Link>
            <Link href="/login" className={styles.mobileSignIn} onClick={() => setOpen(false)}>
              {t("signIn")}
            </Link>
            <Link
              href={pathname}
              locale={otherLocale}
              className={styles.mobileLang}
              lang={otherLocale}
              hrefLang={otherLocale}
              onClick={() => setOpen(false)}
            >
              <GlobeIcon />
              <span>{t("switchLong")}</span>
            </Link>
          </div>
        </nav>

        <div className={styles.actions}>
          {/* In the top bar on desktop and tablet, hidden on phones (it is in the menu there) */}
          <Link
            href={pathname}
            locale={otherLocale}
            className={styles.langPill}
            lang={otherLocale}
            hrefLang={otherLocale}
            aria-label={t("switchAria")}
            onClick={() => setOpen(false)}
          >
            <GlobeIcon />
            <span>{t("switchShort")}</span>
          </Link>

          <Link href="/#start" className={styles.cta}>{t("book")}</Link>

          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setOpen(!open)}
            aria-label={open ? t("closeNav") : t("openNav")}
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