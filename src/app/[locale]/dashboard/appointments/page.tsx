import Link from "next/link";
import { CalendarPlus, CalendarX2, ChevronLeft, ChevronRight } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import Toolbar from "./Toolbar";
import { copy } from "./copy";
import { number } from "./format";
import { getAppointments } from "./service";
import { STATUSES, type StatusFilter } from "./types";
import s from "./appointments.module.css";

type SearchParams = { status?: string; q?: string; page?: string };

export default async function AppointmentsPage({
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

  // Read + validate filters from the URL
  const status: StatusFilter = (STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as StatusFilter)
    : "all";
  const q = (sp.q ?? "").slice(0, 80);
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getAppointments({ status, q, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));

  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    if (status !== "all") u.set("status", status);
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return `${prefix}/dashboard/appointments${qs ? `?${qs}` : ""}`;
  };

  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h2>{t.title}</h2>
          <p>{t.subtitle}</p>
        </div>
        <Link href={`${prefix}/provider`} className={s.bookBtn}>
          <CalendarPlus size={17} />
          {t.book}
        </Link>
      </header>

      <Toolbar
        locale={locale}
        status={status}
        q={q}
        counts={data.counts}
        labels={t.tabs}
        placeholder={t.search}
        clearLabel={t.clear}
      />

      {data.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}><CalendarX2 size={26} /></span>
          <h3>{t.empty.title}</h3>
          <p>{t.empty.text}</p>
          <Link href={`${prefix}/provider`} className={s.bookBtn}>
            <CalendarPlus size={17} />
            {t.book}
          </Link>
        </div>
      ) : (
        <>
          <p className={s.total}>
            {number(data.total, locale)} {t.results}
          </p>

          <div className={s.list}>
            {data.items.map((a) => (
              <AppointmentCard key={a.id} a={a} t={t} locale={locale} prefix={prefix} />
            ))}
          </div>

          {pages > 1 && (
            <nav className={s.pager} aria-label="Pagination">
              <Link
                href={pageHref(data.page - 1)}
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
                href={pageHref(data.page + 1)}
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