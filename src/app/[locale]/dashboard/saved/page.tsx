import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Heart, HeartOff, Home, MapPin, SearchX, Star, Video, Zap,
} from "lucide-react";
import RemoveButton from "./RemoveButton";
import SearchBar from "./SearchBar";
import { copy } from "./copy";
import { getSavedProviders } from "./service";
import s from "./saved.module.css";

const serviceIcon = { consultation: Video, visit: Home, instant: Zap } as const;

type SearchParams = { q?: string; page?: string };

export default async function SavedPage({
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
  const nf = new Intl.NumberFormat(isAr ? "ar-SA" : "en-US");
  const rating = new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  const q = (sp.q ?? "").slice(0, 80);
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = await getSavedProviders({ q, page: requestedPage }, locale);
  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const hasPrev = data.page > 1;
  const hasNext = data.page < pages;

  const pageHref = (p: number) => {
    const u = new URLSearchParams();
    if (q) u.set("q", q);
    if (p > 1) u.set("page", String(p));
    const qs = u.toString();
    return `${prefix}/dashboard/saved${qs ? `?${qs}` : ""}`;
  };

  const price = (n: number, cur: string) =>
    isAr ? `${nf.format(n)} ${cur === "SAR" ? "ر.س" : cur}` : `${cur} ${nf.format(n)}`;

  const nothingSaved = data.total === 0 && !q;

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </header>

      {!nothingSaved && (
        <SearchBar q={q} placeholder={t.search} clearLabel={t.clear} />
      )}

      {data.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            {nothingSaved ? <HeartOff size={26} /> : <SearchX size={26} />}
          </span>
          <h3>{nothingSaved ? t.empty.title : t.noMatch.title}</h3>
          <p>{nothingSaved ? t.empty.text : t.noMatch.text}</p>
          {nothingSaved && (
            <Link href={`${prefix}/provider`} className={s.primary}>{t.empty.cta}</Link>
          )}
        </div>
      ) : (
        <>
          <p className={s.total}>{nf.format(data.total)} {t.results}</p>

          <div className={s.grid}>
            {data.items.map((p) => {
              const initial = p.name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();
              return (
                <article key={p.id} className={s.card}>
                  <RemoveButton id={p.id} label={t.remove} failedLabel={t.removeFailed} />

                  <div className={s.top}>
                    <span className={s.avatar}>
                      {p.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.avatarUrl} alt="" />
                      ) : (
                        initial
                      )}
                    </span>
                    <div className={s.who}>
                      <h3>{p.name}</h3>
                      <p>{p.specialty}</p>
                    </div>
                  </div>

                  <div className={s.meta}>
                    <span><MapPin size={13} />{p.city}</span>
                    <span className={s.rating}>
                      <Star size={13} fill="currentColor" />
                      <b>{rating.format(p.rating)}</b>
                      <small>({nf.format(p.reviewsCount)} {t.reviews})</small>
                    </span>
                  </div>

                  <div className={s.tags}>
                    {p.availableToday && <span className={s.avail}>{t.available}</span>}
                    {p.services.map((k) => {
                      const Icon = serviceIcon[k];
                      return (
                        <span key={k} className={s.tag}><Icon size={12} />{t.services[k]}</span>
                      );
                    })}
                  </div>

                  <div className={s.bottom}>
                    <div className={s.price}>
                      <small>{t.from}</small>
                      <b>{price(p.priceFrom, p.currency)}</b>
                    </div>
                    <Link href={`${prefix}/provider`} className={s.book}>{t.book}</Link>
                  </div>
                </article>
              );
            })}
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
                {t.pager.page} {nf.format(data.page)} {t.pager.of} {nf.format(pages)}
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