import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { Bell, BellOff, CheckCheck, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import ReadToggle from "./ReadToggle";
import MarkAllButton from "./MarkAllButton";
import NotificationItem from "./NotificationItem";
import { copy } from "./copy";
import { getNotifications } from "./service";
import type { AppNotification, NotificationFilter } from "./types";
import s from "./notifications.module.css";

const TZ = "Asia/Riyadh";
const ORDER: NotificationFilter[] = ["all", "unread"];

type SearchParams = { filter?: string; page?: string };

export default async function NotificationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const uiText = await getUiText();
  const { locale } = await params;
  const sp = await searchParams;
  const isAr = locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";
  const loc = isAr ? "ar-SA-u-ca-gregory" : "en-GB";
  const nf = new Intl.NumberFormat(isAr ? "ar-SA" : "en-US");

  const filter: NotificationFilter = sp.filter === "unread" ? "unread" : "all";

  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getNotifications({ filter, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const href = (opts: { filter?: NotificationFilter; page?: number }) => {
    const u = new URLSearchParams();

    const f = opts.filter ?? filter;
    if (f !== "all") u.set("filter", f);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/notifications${qs ? `?${qs}` : ""}`;
  };

  // ---- relative time + day grouping (Saudi time) ----
  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: "auto", style: "short" });
  const dateFmt = new Intl.DateTimeFormat(loc, { day: "numeric", month: "short", timeZone: TZ });
  const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
  const todayKey = dayKey(new Date());
  const yesterdayKey = dayKey(new Date(new Date().getTime() - 24 * 3600 * 1000));

  const ago = (iso: string) => {
    if (!Number.isFinite(Date.parse(iso))) return "?";
    const min = Math.floor((new Date().getTime() - new Date(iso).getTime()) / 60000);
    if (min < 1) return t.justNow;
    if (min < 60) return rtf.format(-min, "minute");
    const h = Math.floor(min / 60);
    if (h < 24) return rtf.format(-h, "hour");
    const d = Math.floor(h / 24);
    if (d < 7) return rtf.format(-d, "day");
    return dateFmt.format(new Date(iso));
  };

  const groups: { label: string; items: AppNotification[] }[] = [];
  for (const n of data.items) {
    const key = Number.isFinite(Date.parse(n.createdAt)) ? dayKey(new Date(n.createdAt)) : "unknown";
    const label =
      key === todayKey ? t.groups.today : key === yesterdayKey ? t.groups.yesterday : t.groups.earlier;
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(n);
    else groups.push({ label, items: [n] });
  }

  const empty = filter === "unread" ? t.empty.unread : t.empty.all;

  return (
    <div className={s.page}>
      <header className={s.hero}><div><span className={s.eyebrow}>{isAr ? "كل ما يهمك، في مكان واحد" : "YOUR UPDATES, ALL IN ONE PLACE"}</span><h1>{t.title}</h1><p>{t.subtitle}</p><div className={s.heroBadges}><span><Inbox size={14}/>{nf.format(data.counts.all)} {isAr ? "إشعار" : "notifications"}</span><span><span className={s.badgeDot}/>{nf.format(data.counts.unread)} {isAr ? "غير مقروء" : "unread"}</span></div></div><div className={s.heroArt} aria-hidden="true"><Bell size={51} strokeWidth={1.3}/><span/></div></header>
      <div className={s.toolbar}>
      <nav className={s.tabs} aria-label={uiText("Filter")}>
        {ORDER.map((f) => (
          <Link
            key={f} aria-current={f === filter ? "page" : undefined}
            href={href({ filter: f })}
            scroll={false}
            className={`${s.tab} ${f === filter ? s.tabActive : ""}`}
          >
            <span>{t.tabs[f]}</span>
            <span className={s.count}>{nf.format(data.counts[f])}</span>
          </Link>
        ))}
      </nav>

        <MarkAllButton through={data.readAllThrough} label={t.markAll} disabled={data.counts.unread === 0}/>
      </div>
      {data.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            {filter === "unread" ? <CheckCheck size={26} /> : <BellOff size={26} />}
          </span>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
        </div>
      ) : (
        <section className={s.card}>
          {groups.map((g, i) => (
            <div key={`${g.label}-${i}`}>
              <p className={s.group}>{g.label}</p>
              <ul className={s.list}>
                {g.items.map((n) => (
                  <li key={n.id}>
                    <NotificationItem
                      id={n.id}
                      kind={n.kind}
                      title={n.title}
                      body={n.body}
                      time={ago(n.createdAt)}
                      read={n.read}
                      href={n.href ? `${prefix}${n.href}` : undefined}
                    />
                    <ReadToggle id={n.id} read={n.read}/>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {pages > 1 && (
        <nav className={s.pager} aria-label={uiText("Pagination")}>
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
            {t.pager.page} {nf.format(data.page)} {t.pager.of} {nf.format(pages)}
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
    </div>
  );
}