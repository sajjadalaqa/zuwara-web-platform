import Link from "next/link";
import {
  CalendarDays, CheckCheck, ChevronLeft, ChevronRight, Hash, Home, Star, Video, Zap,
} from "lucide-react";
import { fullDate } from "../appointments/format";
import DeleteReviewButton from "./DeleteReviewButton";
import ReviewButton from "./ReviewButton";
import Stars from "./Stars";
import { copy } from "./copy";
import { getMyReviews, getPendingReviews, getReviewCounts } from "./service";
import type { ProviderBrief, ReviewTab } from "./types";
import s from "./reviews.module.css";

const typeIcon = { consultation: Video, visit: Home, instant: Zap } as const;
const ORDER: ReviewTab[] = ["pending", "reviewed"];

type SearchParams = { tab?: string; page?: string };

const initialOf = (name: string) =>
  name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();

function ProviderRow({ p }: { p: ProviderBrief }) {
  return (
    <div className={s.who}>
      <span className={s.avatar}>
        {p.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatarUrl} alt="" />
        ) : (
          initialOf(p.name)
        )}
      </span>
      <div className={s.whoText}>
        <h3>{p.name}</h3>
        <p>{p.specialty}</p>
      </div>
    </div>
  );
}

export default async function ReviewsPage({
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

  const tab: ReviewTab = sp.tab === "reviewed" ? "reviewed" : "pending";
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [counts, pendingData, reviewedData] = await Promise.all([
    getReviewCounts(),
    tab === "pending" ? getPendingReviews(requestedPage, locale) : Promise.resolve(null),
    tab === "reviewed" ? getMyReviews(requestedPage, locale) : Promise.resolve(null),
  ]);

  const meta = (pendingData ?? reviewedData)!;
  const pages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < pages;

  const href = (opts: { tab?: ReviewTab; page?: number }) => {
    const u = new URLSearchParams();
    const tb = opts.tab ?? tab;
    if (tb !== "pending") u.set("tab", tb);
    if (opts.page && opts.page > 1) u.set("page", String(opts.page));
    const qs = u.toString();
    return `${prefix}/dashboard/reviews${qs ? `?${qs}` : ""}`;
  };

  const starsText = (n: number) => t.starsLabel.replace("{n}", String(n));
  const empty = t.empty[tab];

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </header>

      <nav className={s.tabs} aria-label="Reviews">
        {ORDER.map((tb) => (
          <Link
            key={tb}
            href={href({ tab: tb })}
            scroll={false}
            className={`${s.tab} ${tb === tab ? s.tabActive : ""}`}
          >
            <span>{t.tabs[tb]}</span>
            <span className={s.count}>{nf.format(counts[tb])}</span>
          </Link>
        ))}
      </nav>
<p className={s.hint}>{t.hints[tab]}</p>
      {meta.items.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            {tab === "pending" ? <CheckCheck size={26} /> : <Star size={26} />}
          </span>
          <h3>{empty.title}</h3>
          <p>{empty.text}</p>
        </div>
      ) : (
        <div className={s.grid}>
          {pendingData?.items.map((p) => {
            const TypeIcon = typeIcon[p.type];
            return (
              <article key={p.appointmentId} className={s.card}>
                <ProviderRow p={p.provider} />
                <div className={s.meta}>
                  <span><TypeIcon size={13} />{t.types[p.type]}</span>
                  <span><CalendarDays size={13} />{t.sessionOn} {fullDate(p.completedAt, locale)}</span>
                  <span><Hash size={13} />{p.number}</span>
                </div>
                <div className={s.bottom}>
                  <ReviewButton
                    mode="create"
                    appointmentId={p.appointmentId}
                    providerName={p.provider.name}
                    t={t}
                  />
                </div>
              </article>
            );
          })}

          {reviewedData?.items.map((r) => (
            <article key={r.id} className={s.card}>
              <div className={s.topRow}>
                <ProviderRow p={r.provider} />
                <div className={s.rate}>
                  <Stars value={r.rating} label={starsText(r.rating)} />
                  <b>{t.ratingLabels[r.rating - 1]}</b>
                </div>
              </div>
              {r.comment && <p className={s.comment}>{r.comment}</p>}
              <div className={s.meta}>
                <span><CalendarDays size={13} />{t.reviewedOn} {fullDate(r.createdAt, locale)}</span>
                {r.updatedAt && <span className={s.edited}>· {t.edited}</span>}
                <span><Hash size={13} />{r.number}</span>
              </div>
              <div className={s.bottom}>
                <ReviewButton
                  mode="edit"
                  appointmentId={r.appointmentId}
                  reviewId={r.id}
                  providerName={r.provider.name}
                  initialRating={r.rating}
                  initialComment={r.comment}
                  t={t}
                />
                <DeleteReviewButton id={r.id} t={t} />
              </div>
            </article>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className={s.pager} aria-label="Pagination">
          <Link
            href={href({ page: meta.page - 1 })}
            scroll={false}
            aria-disabled={!hasPrev}
            className={`${s.pageBtn} ${!hasPrev ? s.pageBtnOff : ""}`}
          >
            <ChevronLeft size={16} className={s.rtlFlip} />
            {t.pager.prev}
          </Link>
          <span className={s.pageInfo}>
            {t.pager.page} {nf.format(meta.page)} {t.pager.of} {nf.format(pages)}
          </span>
          <Link
            href={href({ page: meta.page + 1 })}
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