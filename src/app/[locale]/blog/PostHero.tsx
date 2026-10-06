import { Link } from "@/i18n/navigation";
import { formatDate, getCategory, pick, posts } from "@/data/blog";
import BlogCover from "./BlogCover";
import styles from "./post-hero.module.css";

const Svg = ({ d, size = 15 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const BACK = "M19 12H5M11 6l-6 6 6 6";
const CAL = "M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z";
const CLOCK = "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2";

type Props = {
  post: (typeof posts)[number];
  locale: string;
  backLabel: string;   // e.g. "Back to blog"
  readLabel: string;   // e.g. "5 min read"
};

export default function PostHero({ post, locale, backLabel, readLabel }: Props) {
  const cat = getCategory(post.category);
  const title = pick(post.title, locale);

  return (
    <header className={styles.hero}>
      <div className={styles.bg}>
        <BlogCover category={post.category} cover={post.cover} alt={title} hero />
      </div>
      <div className={styles.shade} aria-hidden="true" />

      <Link href="/blog" className={styles.back}>
        <span className={styles.backIcon}><Svg d={BACK} size={16} /></span>
        <span className={styles.backText}>{backLabel}</span>
      </Link>

      <div className={styles.content}>
        {cat && <span className={styles.tag}>{pick(cat.name, locale)}</span>}
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.excerpt}>{pick(post.excerpt, locale)}</p>
        <div className={styles.meta}>
          <span className={styles.author}>
            <span className={styles.avatar} aria-hidden="true">Z</span>
            {pick(post.author, locale)}
          </span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.item}><Svg d={CAL} /> {formatDate(post.date, locale)}</span>
          <span className={styles.dot} aria-hidden="true" />
          <span className={styles.item}><Svg d={CLOCK} /> {readLabel}</span>
        </div>
      </div>
    </header>
  );
}