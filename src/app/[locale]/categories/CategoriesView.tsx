"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation"; 
import {
  Video, CalendarClock, BriefcaseMedical, HeartHandshake, ScanLine,
  Stethoscope, Syringe, Microscope, Pill, Search, ChevronLeft, ChevronRight,
  ArrowUpRight, SearchX, type LucideIcon,
} from "lucide-react";
import styles from "./categories.module.css";

export type Category = {
  id: number | string;
  slug: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
};

const ICONS: Record<string, LucideIcon> = {
  video: Video, calendar: CalendarClock, bag: BriefcaseMedical, care: HeartHandshake,
  scan: ScanLine, nursing: Stethoscope, syringe: Syringe, lab: Microscope, pill: Pill,
};

export default function CategoriesView({ categories }: { categories: Category[] }) {
  const t = useTranslations("categoriesPage");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  const label = (c: Category) => (isAr && c.nameAr ? c.nameAr : c.name);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      `${c.name} ${c.nameAr ?? ""}`.toLowerCase().includes(q)
    );
  }, [categories, query]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const start = (current - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  const Prev = isAr ? ChevronRight : ChevronLeft;
  const Next = isAr ? ChevronLeft : ChevronRight;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.badge}>{t("badge")}</span>
          <h1 className={styles.title}>
            {t("title")} <span>{t("titleAccent")}</span>
          </h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>

          <label className={styles.search}>
            <Search size={18} aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={t("search")}
              aria-label={t("search")}
            />
          </label>
        </div>
      </section>

      <section className={styles.container}>
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <SearchX size={32} aria-hidden />
            <h2>{t("emptyTitle")}</h2>
            <p>{t("emptyText")}</p>
            <button type="button" onClick={() => setQuery("")}>{t("clear")}</button>
          </div>
        ) : (
          <ul className={styles.grid}>
            {visible.map((c) => {
              const Icon = ICONS[c.icon ?? ""] ?? Stethoscope;
              return (
                <li key={c.id}>
                  <Link href={`/home-services?category=${c.slug}`} className={styles.card}>
                    <span className={styles.iconWrap}><Icon size={30} strokeWidth={1.7} /></span>
                    <h2 className={styles.cardTitle}>{label(c)}</h2>
                    <p className={styles.cardText}>
                      {(isAr ? c.descriptionAr : c.description) ?? t("cardHint")}
                    </p>
                    <span className={styles.cardCta}>
                      {t("explore")} <ArrowUpRight size={16} aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {filtered.length > 0 && (
          <div className={styles.footerBar}>
            <div className={styles.showing}>
              <label>
                {t("display")}
                <select
                  value={perPage}
                  onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                >
                  {[4, 8, 12, 24].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <span>
                {t("showing", {
                  from: start + 1,
                  to: Math.min(start + perPage, filtered.length),
                  total: filtered.length,
                })}
              </span>
            </div>

            <nav className={styles.pager} aria-label={t("pagination")}>
              <button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label={t("previous")}>
                <Prev size={16} /> <span>{t("previous")}</span>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={n === current ? styles.active : ""}
                  aria-current={n === current ? "page" : undefined}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button disabled={current === pages} onClick={() => setPage(current + 1)} aria-label={t("next")}>
                <span>{t("next")}</span> <Next size={16} />
              </button>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
}