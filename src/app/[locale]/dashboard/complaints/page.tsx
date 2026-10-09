import Link from "next/link";
import {
  CalendarDays, ChevronLeft, ChevronRight, ClipboardList, Hash, MessageSquare, Plus,
} from "lucide-react";
import { fullDate, number } from "../appointments/format";
import { categoryIcon } from "./categories";
import { copy } from "./copy";
import { getComplaints } from "./service";
import { COMPLAINT_STATUSES, type StatusFilter } from "./types";
import s from "./complaints.module.css";

const ORDER: StatusFilter[] = ["all", ...COMPLAINT_STATUSES];

const statusTone = {
  open: s.stOpen,
  in_review: s.stReview,
  resolved: s.stResolved,
  closed: s.stClosed,
} as const;

const catTone = {
  appointment: s.tPurple,
  provider: s.tRose,
  payment: s.tIndigo,
  request: s.tMint,
  app: s.tSky,
  other: s.tAmber,
} as const;

type SearchParams = { status?: string; page?: string };

export default async function ComplaintsPage({
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

  const status: StatusFilter = (COMPLAINT_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as StatusFilter)
    : "all";
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getComplaints({ status, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const href = (opts: { status?: StatusFilter; page?: number }) => {
    const u = new URLSearchParams();
    const st = opts.status ?? status;
    if (st !== "all") u.set("status", st);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/complaints${qs ? `?${qs}` : ""}`;
  };

  const repliesText = (n: number) =>
    n === 0 ? t.replies.none : n === 1 ? t.replies.one : t.replies.many.replace("{n}", number(n, locale));

  const nothingAtAll = data.counts.all === 0;
  const empty = nothingAtAll ? t.empty.all : t.empty.filtered;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <Link href={`${prefix}/dashboard/complaints/new`} className={s.newBtn}>
          <Plus size={17} />
          {t.newComplaint}
        </Link>
      </header>

      <nav className={s.tabs} aria-label="Status">
        {ORDER.map((st) => (
          <Link
            key={st}
            href={href({ status: st })}
            scroll={false}
            className={`${s.tab} ${st === status ? s.tabActive : ""}`}
          >
            <span>{t.tabs[st]}</span>
            <span className={s.count}>{number(data.counts[st] ?? 0, locale)}</span>
          </Link>
        ))}
      </nav>

      {data.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}><ClipboardList size={26} /></span>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
          {nothingAtAll && (
            <Link href={`${prefix}/dashboard/complaints/new`} className={s.newBtn}>
              <Plus size={17} />
              {t.empty.all.cta}
            </Link>
          )}
        </div>
      ) : (
        <>
          <p className={s.total}>{number(data.total, locale)} {t.results}</p>

          <div className={s.grid}>
            {data.items.map((c) => {
              const Icon = categoryIcon[c.category];
              return (
                <article key={c.id} className={s.card}>
                  <div className={s.top}>
                    <span className={`${s.catIcon} ${catTone[c.category]}`}><Icon size={19} /></span>
                    <div className={s.titleBlock}>
                      <h3>{c.subject}</h3>
                      <p>{t.categories[c.category]} · {c.number}</p>
                    </div>
                    <span className={`${s.chip} ${statusTone[c.status]}`}>{t.status[c.status]}</span>
                  </div>

                  <p className={s.desc}>{c.description}</p>

                  <div className={s.meta}>
                    {c.relatedRef && (
                      <span><Hash size={13} />{t.relatedTo} {c.relatedRef}</span>
                    )}
                    <span><CalendarDays size={13} />{t.submittedOn} {fullDate(c.createdAt, locale)}</span>
                  </div>

                  <div className={s.bottom}>
                    <span className={`${s.replies} ${c.repliesCount > 0 ? s.repliesOn : ""}`}>
                      <MessageSquare size={13} />
                      {repliesText(c.repliesCount)}
                    </span>
                    <Link href={`${prefix}/dashboard/complaints/${c.id}`} className={`${s.btn} ${s.btnGhost}`}>
                      {t.view}
                    </Link>
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