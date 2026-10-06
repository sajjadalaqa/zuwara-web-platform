"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, formatDate, getPost, getRelated, pick } from "@/data/blog";
import BlogCover from "../BlogCover";
import PostHero from "../PostHero";
import type { IconType } from "react-icons";
import { FaWhatsapp, FaFacebookF, FaLinkedinIn, FaTelegramPlane } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import styles from "./blog-post.module.css";

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const BULB = "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0012 3z";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const LINK = "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1";
const SHARE = "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13";
const CLOSE = "M6 6l12 12M18 6L6 18";

export default function BlogPost({ slug }: { slug: string }) {
  const t = useTranslations("blogPage");
  const locale = useLocale();
  const post = getPost(slug)!;
  const related = getRelated(slug, post.category);

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [canShare, setCanShare] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const title = pick(post.title, locale);

  useEffect(() => {
    setPageUrl(window.location.href);
    setCanShare(typeof navigator.share === "function");
  }, []);

  // Close popup with Escape + lock page scroll while it is open
  useEffect(() => {
    if (!shareOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShareOpen(false); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [shareOpen]);

  const u = encodeURIComponent(pageUrl);
  const tt = encodeURIComponent(title);
  const socials: { name: string; href: string; Icon: IconType; cls: string }[] = [
    { name: "WhatsApp", href: `https://wa.me/?text=${tt}%20${u}`, Icon: FaWhatsapp, cls: "brandWa" },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${tt}&url=${u}`, Icon: FaXTwitter, cls: "brandX" },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FaFacebookF, cls: "brandFb" },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: FaLinkedinIn, cls: "brandLi" },
    { name: "Telegram", href: `https://t.me/share/url?url=${u}&text=${tt}`, Icon: FaTelegramPlane, cls: "brandTg" },
  ];

  const nativeShare = async () => {
    try { await navigator.share({ title, url: pageUrl }); } catch { /* cancelled */ }
  };

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <main className={styles.page}>
      <div className={styles.progress} aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <div className={styles.container}>
        <PostHero
          post={post}
          locale={locale}
          backLabel={t("back")}
          readLabel={t("minRead", { count: post.readMinutes })}
        />

        <div className={styles.layout}>
          <article className={styles.article}>
            {post.content.map((b, i) => {
              if (b.type === "h2") return <h2 key={i}>{pick(b.text, locale)}</h2>;
              if (b.type === "p") return <p key={i}>{pick(b.text, locale)}</p>;
              if (b.type === "quote") return <blockquote key={i}>{pick(b.text, locale)}</blockquote>;
              if (b.type === "tip")
                return (
                  <aside key={i} className={styles.tip}>
                    <span className={styles.tipIcon}><Svg d={BULB} /></span>
                    <div><strong>{t("good")}</strong><p>{pick(b.text, locale)}</p></div>
                  </aside>
                );
              if (b.type === "ul")
                return (
                  <ul key={i}>
                    {b.items.map((it, j) => <li key={j}>{pick(it, locale)}</li>)}
                  </ul>
                );
              return null;
            })}

            {/* Share bar: one button that opens the popup */}
            <div className={styles.shareBox}>
              <p className={styles.shareText}>{t("share")}</p>
              <button type="button" className={styles.shareOpen} onClick={() => setShareOpen(true)}
                aria-haspopup="dialog">
                <Svg d={SHARE} size={16} /> {t("share")}
              </button>
            </div>
          </article>

          <aside className={styles.side}>
            <div className={styles.box}>
              <h3>{t("categories")}</h3>
              <ul className={styles.catList}>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/blog?category=${c.id}`} className={c.id === post.category ? styles.catOn : ""}>
                      <Svg d={c.icon} size={16} /> {pick(c.name, locale)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${styles.box} ${styles.boxCta}`}>
              <h3>{t("ctaTitle")}</h3>
              <p>{t("ctaText")}</p>
              <Link href="/#start" className={styles.ctaBtn}>{t("ctaButton")}</Link>
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className={styles.related}>
            <h2>{t("related")}</h2>
            <ul>
              {related.map((r) => (
                <li key={r.slug}>
                  <Link href={`/blog/${r.slug}`} className={styles.rCard}>
                    <div className={styles.rMedia}><BlogCover category={r.category} cover={r.cover} alt={pick(r.title, locale)} /></div>
                    <div className={styles.rBody}>
                      <span>{formatDate(r.date, locale)} · {t("minRead", { count: r.readMinutes })}</span>
                      <h3>{pick(r.title, locale)}</h3>
                      <em>{t("readMore")} <Svg d={ARROW} size={15} /></em>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Share popup */}
      {shareOpen && (
        <div className={styles.shareOverlay} onClick={() => setShareOpen(false)}>
          <div className={styles.shareModal} role="dialog" aria-modal="true" aria-label={t("share")}
            onClick={(e) => e.stopPropagation()}>
            <div className={styles.shareHead}>
              <h3>{t("share")}</h3>
              <button type="button" className={styles.shareClose} onClick={() => setShareOpen(false)}
                aria-label={t("close")}>
                <Svg d={CLOSE} size={18} />
              </button>
            </div>

            <div className={styles.shareGrid}>
              {socials.map(({ name, href, Icon, cls }) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer"
                  className={`${styles.shareItem} ${styles[cls]}`}>
                  <span className={styles.shareIcon}><Icon size={22} /></span>
                  {name}
                </a>
              ))}
              {canShare && (
                <button type="button" className={`${styles.shareItem} ${styles.brandMore}`} onClick={nativeShare}>
                  <span className={styles.shareIcon}><Svg d={SHARE} size={22} /></span>
                  {t("shareNative")}
                </button>
              )}
            </div>

            <div className={styles.copyRow}>
              <input type="text" readOnly value={pageUrl} onFocus={(e) => e.currentTarget.select()}
                aria-label="Link" dir="ltr" />
              <button type="button" onClick={copyLink}>
                <Svg d={LINK} size={16} /> {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}