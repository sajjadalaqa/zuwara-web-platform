"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import styles from "./HomeServices.module.css";

type Category = { id: string | number; name: string; imageUrl?: string | null; serviceCount: number };

export function CategoryExplorer({ categories }: { categories: Category[] }) {
  const t = useTranslations("HomeServices.categories");
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  }, [categories, query]);

  return (
    <>
      <div className={styles.catHead}>
        <div className={styles.reveal}>
          <span className={styles.eyebrow}>{t("eyebrow")}</span>
          <h2>{t("title")}</h2>
          <p>{t("intro")}</p>
        </div>
        <div className={styles.searchBar}>
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchLabel")}
          />
          <span className={styles.count} aria-live="polite">
            {t("count", { shown: results.length, total: categories.length })}
          </span>
        </div>
      </div>

      {results.length ? (
        <div className={styles.grid}>
          {results.map((item, index) => (
            <Link
              key={item.id}
              href={`/home-services?category_id=${item.id}`}
              className={styles.card}
              style={{ "--i": index % 8 } as CSSProperties}
            >
              <span className={styles.thumb}>
                {item.imageUrl ? (
                  <SafeImage src={item.imageUrl} alt="" width={48} height={48} fallbackIcon="home" />
                ) : (
                  <Icon name="home" />
                )}
              </span>
              <span className={styles.cardText}>
                <strong>{item.name}</strong>
                <small>{t("services", { count: item.serviceCount })}</small>
              </span>
              <span className={styles.go}><Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>{t("noMatch", { query })}</p>
      )}
    </>
  );
}