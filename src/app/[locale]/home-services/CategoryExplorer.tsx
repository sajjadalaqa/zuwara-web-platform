"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { Icon } from "@/components/Icon";
import { SafeImage } from "@/components/SafeImage";
import styles from "./HomeServices.module.css";

type Category = { id: string | number; name: string; imageUrl?: string | null; serviceCount: number };

export function CategoryExplorer({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories;
  }, [categories, query]);

  return (
    <>
      <div className={styles.catHead}>
        <div className={styles.reveal}>
          <span className={styles.eyebrow}>Categories</span>
          <h2>Find the right service for your needs</h2>
          <p>Explore our categories and choose the service that fits your requirements.</p>
        </div>
        <div className={styles.searchBar}>
          <Icon name="search" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search categories, e.g. nursing"
            aria-label="Search service categories"
          />
          <span className={styles.count} aria-live="polite">{results.length} of {categories.length}</span>
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
                <small>{item.serviceCount} services</small>
              </span>
              <span className={styles.go}><Icon name="arrow" size={16} /></span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.empty}>No categories match “{query}”. Try a shorter word.</p>
      )}
    </>
  );
}