"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, formatDate, getCategory, pick, posts } from "@/data/blog";
import BlogCover from "./BlogCover";
import styles from "./blog.module.css";

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const SEARCH = "M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-3.5-3.5";
const ARROW = "M5 12h14M13 6l6 6-6 6";
const CLOCK = "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2";
const EMPTY = "M5 4h14v16H5zM9 9h6M9 13h4";

export default function BlogView({ initialCategory }: { initialCategory: string }) {
  const t = useTranslations("blogPage");
  const locale = useLocale();

  const valid = initialCategory === "all" || categories.some((c) => c.id === initialCategory);
  const [active, setActive] = useState(valid ? initialCategory : "all");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    posts.forEach((p) => { m[p.category] = (m[p.category] ?? 0) + 1; });
    return m;
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const okCat = active === "all" || p.category === active;
      const okText = !q || `${p.title.en} ${p.title.ar} ${p.excerpt.en} ${p.excerpt.ar}`.toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [active, query]);

  const reset = () => { setActive("all"); setQuery(""); };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.pill}>{t("pill")}</span>
          <h1 className={styles.title}>{t("title")} <span>{t("titleAccent")}</span></h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>

          <label className={styles.search}>
            <Svg d={SEARCH} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")} aria-label={t("search")} />
          </label>
        </div>
      </section>

      <section className={styles.container}>
        <div className={styles.chips} role="group" aria-label={t("categories")}>
          <button type="button" className={active === "all" ? styles.chipOn : ""} onClick={() => setActive("all")}>
            {t("all")} <em>{posts.length}</em>
          </button>
          {categories.map((c) => {
            const n = counts[c.id] ?? 0;
            return (
              <button key={c.id} type="button" disabled={n === 0}
                className={active === c.id ? styles.chipOn : ""} onClick={() => setActive(c.id)}>
                <Svg d={c.icon} size={15} /> {pick(c.name, locale)} <em>{n}</em>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <Svg d={EMPTY} size={34} />
            <h2>{t("emptyTitle")}</h2>
            <p>{t("emptyText")}</p>
            <button type="button" onClick={reset}>{t("clear")}</button>
          </div>
        ) : (
          <ul className={styles.grid}>
            {filtered.map((p, i) => {
              const cat = getCategory(p.category);
              const title = pick(p.title, locale);
              return (
                <li key={p.slug} className={i === 0 && filtered.length > 1 && active === "all" && !query ? styles.featured : ""}>
                  <Link href={`/blog/${p.slug}`} className={styles.card}>
                    <div className={styles.media}>
                      <BlogCover category={p.category} cover={p.cover} alt={title} />
                      {cat && <span className={styles.tag}>{pick(cat.name, locale)}</span>}
                    </div>
                    <div className={styles.body}>
                      <div className={styles.meta}>
                        <span>{formatDate(p.date, locale)}</span>
                        <span className={styles.dot} aria-hidden="true" />
                        <span className={styles.read}><Svg d={CLOCK} size={14} /> {t("minRead", { count: p.readMinutes })}</span>
                      </div>
                      <h2 className={styles.cardTitle}>{title}</h2>
                      <p className={styles.excerpt}>{pick(p.excerpt, locale)}</p>
                      <div className={styles.foot}>
                        <span className={styles.author}>
                          <span className={styles.avatar} aria-hidden="true">Z</span>
                          {pick(p.author, locale)}
                        </span>
                        <span className={styles.more}>{t("readMore")} <Svg d={ARROW} size={16} /></span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.cta}>
          <div>
            <h2>{t("ctaTitle")}</h2>
            <p>{t("ctaText")}</p>
          </div>
          <Link href="/#start" className={styles.ctaBtn}>{t("ctaButton")}</Link>
        </div>
      </section>
    </main>
  );
}