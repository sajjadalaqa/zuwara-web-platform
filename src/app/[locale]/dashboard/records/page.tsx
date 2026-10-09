import Link from "next/link";
import {
  CalendarDays, ChevronLeft, ChevronRight, Download, Eye, FileText,
  FolderOpen, Image as ImageIcon, Plus, Stethoscope,
} from "lucide-react";
import { fullDate, number } from "../appointments/format";
import DeleteRecordButton from "./DeleteRecordButton";
import SearchBar from "./SearchBar";
import { categoryIcon } from "./categories";
import { copy } from "./copy";
import { getRecords } from "./service";
import { CATEGORIES, type CategoryFilter } from "./types";
import { formatSize } from "./validation";
import s from "./records.module.css";

const ORDER: CategoryFilter[] = ["all", ...CATEGORIES];

const catTone = {
  lab: s.tIndigo,
  imaging: s.tSky,
  prescription: s.tMint,
  report: s.tPurple,
  vaccination: s.tRose,
  other: s.tAmber,
} as const;

type SearchParams = { category?: string; q?: string; page?: string };

export default async function RecordsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const category: CategoryFilter = (CATEGORIES as readonly string[]).includes(sp.category ?? "")
    ? (sp.category as CategoryFilter)
    : "all";
  const q = (sp.q ?? "").slice(0, 80);
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getRecords({ category, q, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const href = (opts: { category?: CategoryFilter; page?: number }) => {
    const u = new URLSearchParams();
    const c = opts.category ?? category;
    if (c !== "all") u.set("category", c);
    if (q) u.set("q", q);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/records${qs ? `?${qs}` : ""}`;
  };

  const nothingAtAll = data.counts.all === 0 && !q;
  const empty = nothingAtAll ? t.empty.all : t.empty.filtered;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <Link href={`${prefix}/dashboard/records/new`} className={s.newBtn}>
          <Plus size={17} />
          {t.upload}
        </Link>
      </header>

      {!nothingAtAll && (
        <>
          <SearchBar q={q} category={category} placeholder={t.search} clearLabel={t.clear} />

          <nav className={s.tabs} aria-label="Categories">
            {ORDER.map((c) => (
              <Link
                key={c}
                href={href({ category: c })}
                scroll={false}
                className={`${s.tab} ${c === category ? s.tabActive : ""}`}
              >
                <span>{t.tabs[c]}</span>
                <span className={s.count}>{number(data.counts[c] ?? 0, locale)}</span>
              </Link>
            ))}
          </nav>
        </>
      )}

      {data.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}><FolderOpen size={26} /></span>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
          {nothingAtAll && (
            <Link href={`${prefix}/dashboard/records/new`} className={s.newBtn}>
              <Plus size={17} />
              {t.empty.all.cta}
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className={s.total}>{number(data.total, locale)} {t.results}</p>

          <div className={s.grid}>
            {data.items.map((r) => {
              const Icon = categoryIcon[r.category];
              const FileIcon = r.fileType.startsWith("image/") ? ImageIcon : FileText;
              const fileHref = `${prefix}/dashboard/records/${r.id}/file`;
              return (
                <article key={r.id} className={s.card}>
                  <div className={s.top}>
                    <span className={`${s.catIcon} ${catTone[r.category]}`}><Icon size={19} /></span>
                    <div className={s.titleBlock}>
                      <h3>{r.title}</h3>
                      <p>{t.categories[r.category]}</p>
                    </div>
                    <DeleteRecordButton id={r.id} t={t} />
                  </div>

                  {r.notes && <p className={s.desc}>{r.notes}</p>}

                  <div className={s.meta}>
                    <span><CalendarDays size={13} />{fullDate(`${r.recordDate}T12:00:00Z`, locale)}</span>
                    {r.provider && <span><Stethoscope size={13} />{r.provider}</span>}
                    <span><FileIcon size={13} />{formatSize(r.fileSize, locale)}</span>
                  </div>

                  <div className={s.bottom}>
                    <a
                      href={fileHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${s.btn} ${s.btnPrimary}`}
                    >
                      <Eye size={14} />
                      {t.view}
                    </a>
                    <a
                      href={`${fileHref}?download=1`}
                      download
                      className={`${s.btn} ${s.btnGhost}`}
                    >
                      <Download size={14} />
                      {t.download}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {pages > 1 && (
            <nav className={s.pager} aria-label="Pagination">
              <Link
                href={href({ page: data.page - 1 })}
                scroll={false}
                aria-disabled={!hasPrev}
                className={`${s.pageBtn} ${!hasPrev ? s.pageBtnOff : ""}`}
              >
                <ChevronLeft size={16} className={s.rtlFlip} />
                {t.pager.prev}
              </Link>
              <span className={s.pageInfo}>
                {t.pager.page} {number(data.page, locale)} {t.pager.of} {number(pages, locale)}
              </span>
              <Link
                href={href({ page: data.page + 1 })}
                scroll={false}
                aria-disabled={!hasNext}
                className={`${s.pageBtn} ${!hasNext ? s.pageBtnOff : ""}`}
              >
                {t.pager.next}
                <ChevronRight size={16} className={s.rtlFlip} />
              </Link>
            </nav>
          )}
        </>
      )}
    </div>
  );
}