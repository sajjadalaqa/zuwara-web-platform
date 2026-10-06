// src/app/[locale]/blog/BlogCover.tsx
import { getCategory } from "@/data/blog";
import styles from "./blog-cover.module.css";

/** Designed cover: uses the post image when provided, otherwise a branded gradient with the category icon. */
export default function BlogCover({ category, cover, alt, hero }: { category: string; cover?: string; alt: string; hero?: boolean }) {
  const cat = getCategory(category);
  if (cover) {
    // eslint-disable-next-line @next/next/no-img-element
    return <div className={styles.cover}><img src={cover} alt={alt} loading="lazy" /></div>;
  }
  return (
    <div className={`${styles.cover} ${styles.art} ${hero ? styles.hero : ""} ${styles[`tone_${category.replace(/-/g, "_")}`] ?? ""}`} aria-hidden="true">
      <span className={styles.ring1} />
      <span className={styles.ring2} />
      <span className={styles.dots} />
      <span className={styles.iconBox}>
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d={cat?.icon ?? ""} />
        </svg>
      </span>
    </div>
  );
}