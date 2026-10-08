import Link from "next/link";
import {
  Banknote, CalendarDays, ChevronLeft, ChevronRight, ClipboardList, MapPin, Plus,
} from "lucide-react";
import { fullDate, money, number } from "../appointments/format";
import CancelRequestButton from "./CancelRequestButton";
import { categoryIcon } from "./categories";
import { copy } from "./copy";
import { getRequests } from "./service";
import { REQUEST_STATUSES, type StatusFilter } from "./types";
import s from "./requests.module.css";

const ORDER: StatusFilter[] = ["all", ...REQUEST_STATUSES];

const statusTone = {
  open: s.stOpen,
  in_progress: s.stProgress,
  completed: s.stDone,
  cancelled: s.stCancelled,
} as const;

const catTone = {
  nursing: s.tPurple,
  caregiver: s.tRose,
  laboratory: s.tIndigo,
  therapy: s.tMint,
  injection: s.tAmber,
  pharmacy: s.tSky,
} as const;

type SearchParams = { status?: string; page?: string };

export default async function RequestsPage({
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

  const status: StatusFilter = (REQUEST_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as StatusFilter)
    : "all";
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getRequests({ status, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const href = (opts: { status?: StatusFilter; page?: number }) => {
    const u = new URLSearchParams();
    const st = opts.status ?? status;
    if (st !== "all") u.set("status", st);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/requests${qs ? `?${qs}` : ""}`;
  };

  const offersText = (n: number) =>
    n === 0 ? t.offers.none
    : n === 1 ? t.offers.one
    : n === 2 ? t.offers.two
    : t.offers.many.replace("{n}", number(n, locale));

  const nothingAtAll = data.counts.all === 0;
  const empty = nothingAtAll ? t.empty.all : t.empty.filtered;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <Link href={`${prefix}/dashboard/requests/new`} className={s.newBtn}>
          <Plus size={17} />
          {t.newRequest}
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
            <Link href={`${prefix}/dashboard/requests/new`} className={s.newBtn}>
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
              return (
                <article key={r.id} className={s.card}>
                  <div className={s.top}>
                    <span className={`${s.catIcon} ${catTone[r.category]}`}><Icon size={19} /></span>
                    <div className={s.titleBlock}>
                      <h3>{r.title}</h3>
                      <p>{t.categories[r.category]} · {r.number}</p>
                    </div>
                    <span className={`${s.chip} ${statusTone[r.status]}`}>{t.status[r.status]}</span>
                  </div>

                  <p className={s.desc}>{r.description}</p>

                  <div className={s.meta}>
                    <span><MapPin size={13} />{r.city}</span>
                    <span><CalendarDays size={13} />{fullDate(`${r.preferredDate}T12:00:00Z`, locale)}</span>
                    {r.budget !== undefined && (
                      <span><Banknote size={13} />{money(r.budget, r.currency, locale)}</span>
                    )}
                  </div>

                  <div className={s.bottom}>
                    <span className={`${s.offers} ${r.offersCount > 0 ? s.offersOn : ""}`}>
                      {r.provider && r.status !== "open" ? r.provider.name : offersText(r.offersCount)}
                    </span>
                    <div className={s.actions}>
                      <Link href={`${prefix}/dashboard/requests/${r.id}`} className={`${s.btn} ${s.btnGhost}`}>
                        {t.view}
                      </Link>
                      {r.status === "open" && <CancelRequestButton id={r.id} t={t} />}
                    </div>
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