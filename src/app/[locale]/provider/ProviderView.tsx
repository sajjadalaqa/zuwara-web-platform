"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./provider.module.css";

export type Provider = {
  id: number | string;
  name: string;
  nameAr?: string;
  title?: string;
  titleAr?: string;
  image?: string;
};

/* Small inline icons: no extra package needed */
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);
const SearchIcon = () => <Svg><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Svg>;
const ArrowIcon = () => <Svg><path d="M5 12h14M13 6l6 6-6 6" /></Svg>;
const ChevronIcon = ({ dir }: { dir: "left" | "right" }) => (
  <Svg><path d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} /></Svg>
);
const EmptyIcon = () => <Svg><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></Svg>;

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function ProviderCard({ p, name, title }: { p: Provider; name: string; title?: string }) {
  const t = useTranslations("providerPage");
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(p.image) && !failed;

  return (
    <Link href={`/provider/${p.id}`} className={styles.card}>
      <div className={styles.photo}>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={name} loading="lazy" onError={() => setFailed(true)} />
        ) : (
          <span className={styles.initials} aria-hidden="true">{initials(name)}</span>
        )}
        <span className={styles.badge}>{t("verified")}</span>
      </div>
      <div className={styles.info}>
        <h2 className={styles.name}>{name}</h2>
        {title ? <p className={styles.role}>{title}</p> : <p className={styles.roleEmpty}>&nbsp;</p>}
        <span className={styles.cta}>
          {t("view")} <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}

export default function ProviderView({ providers }: { providers: Provider[] }) {
  const t = useTranslations("providerPage");
  const isAr = useLocale() === "ar";

  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  const nameOf = (p: Provider) => (isAr && p.nameAr ? p.nameAr : p.name);
  const titleOf = (p: Provider) => (isAr && p.titleAr ? p.titleAr : p.title);

  const roles = useMemo(() => {
    const set = new Set<string>();
    providers.forEach((p) => { const r = titleOf(p); if (r) set.add(r); });
    return Array.from(set).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, isAr]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return providers.filter((p) => {
      const matchRole = role === "all" || titleOf(p) === role;
      const matchText = !q || `${p.name} ${p.nameAr ?? ""} ${p.title ?? ""} ${p.titleAr ?? ""}`.toLowerCase().includes(q);
      return matchRole && matchText;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers, query, role, isAr]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const current = Math.min(page, pages);
  const start = (current - 1) * perPage;
  const visible = filtered.slice(start, start + perPage);

  const reset = () => { setQuery(""); setRole("all"); setPage(1); };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.container}>
          <span className={styles.pill}>{t("pill")}</span>
          <h1 className={styles.title}>
            {t("title")} <span>{t("titleAccent")}</span>
          </h1>
          <p className={styles.subtitle}>{t("subtitle")}</p>

          <label className={styles.search}>
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder={t("search")}
              aria-label={t("search")}
            />
          </label>

          {roles.length > 1 && (
            <div className={styles.chips} role="group" aria-label={t("filter")}>
              <button type="button" className={role === "all" ? styles.chipOn : ""}
                onClick={() => { setRole("all"); setPage(1); }}>
                {t("all")}
              </button>
              {roles.map((r) => (
                <button key={r} type="button" className={role === r ? styles.chipOn : ""}
                  onClick={() => { setRole(r); setPage(1); }}>
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={styles.container}>
        {visible.length === 0 ? (
          <div className={styles.empty}>
            <EmptyIcon />
            <h2>{t("emptyTitle")}</h2>
            <p>{t("emptyText")}</p>
            <button type="button" onClick={reset}>{t("clear")}</button>
          </div>
        ) : (
          <ul className={styles.grid}>
            {visible.map((p) => (
              <li key={p.id}>
                <ProviderCard p={p} name={nameOf(p)} title={titleOf(p)} />
              </li>
            ))}
          </ul>
        )}

        {filtered.length > 0 && (
          <div className={styles.footerBar}>
            <div className={styles.showing}>
              <label>
                {t("display")}
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
                  {[4, 8, 12, 24].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
              <span>
                {t("showing", { from: start + 1, to: Math.min(start + perPage, filtered.length), total: filtered.length })}
              </span>
            </div>

            <nav className={styles.pager} aria-label={t("pagination")}>
              <button disabled={current === 1} onClick={() => setPage(current - 1)} aria-label={t("previous")}>
                <ChevronIcon dir={isAr ? "right" : "left"} /> <span>{t("previous")}</span>
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} className={n === current ? styles.active : ""}
                  aria-current={n === current ? "page" : undefined} onClick={() => setPage(n)}>
                  {n}
                </button>
              ))}
              <button disabled={current === pages} onClick={() => setPage(current + 1)} aria-label={t("next")}>
                <span>{t("next")}</span> <ChevronIcon dir={isAr ? "left" : "right"} />
              </button>
            </nav>
          </div>
        )}
      </section>
    </main>
  );
}