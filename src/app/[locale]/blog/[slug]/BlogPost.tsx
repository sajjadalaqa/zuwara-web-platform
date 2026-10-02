"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, formatDate, getCategory, getPost, getRelated, pick } from "@/data/blog";
import BlogCover from "../BlogCover";
import styles from "./blog-post.module.css";

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const BACK = "M15 6l-6 6 6 6";
const CLOCK = "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2";
const CAL = "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4";
const BULB = "M9 18h6M10 21h4M12 3a6 6 0 00-4 10.5c.7.7 1 1.4 1 2.5h6c0-1.1.3-1.8 1-2.5A6 6 0 0012 3z";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const LINK = "M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1";

export default function BlogPost({ slug }: { slug: string }) {
  const t = useTranslations("blogPage");
  const locale = useLocale();
  const post = getPost(slug)!;
  const cat = getCategory(post.category);
  const related = getRelated(slug, post.category);
  const title = pick(post.title, locale);

  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

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

      <header className={styles.head}>
        <div className={styles.narrow}>
          <Link href="/blog" className={styles.back}>
            <span className={styles.backIcon}><Svg d={BACK} size={16} /></span>
            {t("back")}
          </Link>
          {cat && <span className={styles.tag}>{pick(cat.name, locale)}</span>}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lead}>{pick(post.excerpt, locale)}</p>
          <div className={styles.meta}>
            <span className={styles.author}><span className={styles.avatar} aria-hidden="true">Z</span>{pick(post.author, locale)}</span>
            <span><Svg d={CAL} size={15} /> {formatDate(post.date, locale)}</span>
            <span><Svg d={CLOCK} size={15} /> {t("minRead", { count: post.readMinutes })}</span>
          </div>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.banner}><BlogCover category={post.category} cover={post.cover} alt={title} /></div>

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

            <div className={styles.share}>
              <span>{t("share")}</span>
              <button type="button" onClick={copyLink}><Svg d={LINK} size={16} /> {copied ? t("copied") : t("copy")}</button>
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
    </main>
  );
}