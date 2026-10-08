import Link from "next/link";
import {
  ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, Receipt,
  TrendingDown, TrendingUp, Undo2, Wallet,
} from "lucide-react";
import { money, number } from "../appointments/format";
import TopUpButton from "./TopUpButton";
import { copy } from "./copy";
import { getTransactions, getWalletSummary } from "./service";
import { TX_TYPES, type TxFilter } from "./types";
import s from "./wallet.module.css";

const typeIcon = { topup: ArrowDownLeft, payment: ArrowUpRight, refund: Undo2 } as const;
const typeTone = { topup: s.iconIn, payment: s.iconOut, refund: s.iconRefund } as const;
const statusTone = { pending: s.stPending, failed: s.stFailed } as const;
const ORDER: TxFilter[] = ["all", ...TX_TYPES];

type SearchParams = { type?: string; page?: string };

export default async function WalletPage({
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

  const type: TxFilter = (TX_TYPES as readonly string[]).includes(sp.type ?? "")
    ? (sp.type as TxFilter)
    : "all";
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [summary, data] = await Promise.all([
    getWalletSummary(),
    getTransactions({ type, page: requestedPage }, locale),
  ]);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const href = (opts: { type?: TxFilter; page?: number }) => {
    const u = new URLSearchParams();
    const tp = opts.type ?? type;
    if (tp !== "all") u.set("type", tp);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/wallet${qs ? `?${qs}` : ""}`;
  };

  const dt = new Intl.DateTimeFormat(isAr ? "ar-SA-u-ca-gregory" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  });

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </header>

      {/* ===== Balance ===== */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <div>
            <p className={s.balLabel}>
              <Wallet size={15} />
              {t.available}
            </p>
            <p className={s.balance}>{money(summary.balance, summary.currency, locale)}</p>
          </div>
          <TopUpButton t={t} locale={locale} />
        </div>

        <div className={s.mini}>
          <div className={s.miniItem}>
            <small><TrendingUp size={13} />{t.in30}</small>
            <b>{money(summary.moneyIn30d, summary.currency, locale)}</b>
          </div>
          <div className={s.miniItem}>
            <small><TrendingDown size={13} />{t.out30}</small>
            <b>{money(summary.moneyOut30d, summary.currency, locale)}</b>
          </div>
        </div>
      </section>

      {/* ===== Transactions ===== */}
      <section className={s.card}>
        <div className={s.cardHead}>
          <h2>{t.txTitle}</h2>
          <span className={s.total}>{number(data.total, locale)} {t.results}</span>
        </div>

        <nav className={s.tabs} aria-label="Type">
          {ORDER.map((tp) => (
            <Link
              key={tp}
              href={href({ type: tp })}
              scroll={false}
              className={`${s.tab} ${tp === type ? s.tabActive : ""}`}
            >
              <span>{t.tabs[tp]}</span>
              <span className={s.count}>{number(data.counts[tp] ?? 0, locale)}</span>
            </Link>
          ))}
        </nav>

        {data.items.length === 0 ? (
          <div className={s.empty}>
            <span className={s.emptyIcon}><Receipt size={26} /></span>
            <h3>{t.empty.title}</h3>
            <p>{t.empty.text}</p>
            <TopUpButton t={t} locale={locale} label={t.empty.cta} />
          </div>
        ) : (
          <ul className={s.list}>
            {data.items.map((tx) => {
              const Icon = typeIcon[tx.type];
              const isIn = tx.direction === "in";
              const failed = tx.status === "failed";
              const sub = [tx.reference, tx.method].filter(Boolean).join(" · ");
              return (
                <li key={tx.id} className={s.row}>
                  <span className={`${s.txIcon} ${typeTone[tx.type]}`}><Icon size={17} /></span>
                  <div className={s.txText}>
                    <h3>{t.types[tx.type]}</h3>
                    <p>{sub}</p>
                    <small>{dt.format(new Date(tx.createdAt))}</small>
                  </div>
                  <div className={s.amt}>
                    <b dir="ltr" className={failed ? s.dead : isIn ? s.plus : s.minus}>
                      {isIn ? "+" : "−"}
                      {money(tx.amount, tx.currency, locale)}
                    </b>
                    {tx.status !== "completed" && (
                      <span className={`${s.chip} ${statusTone[tx.status]}`}>
                        {t.status[tx.status]}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
    </div>
  );
}