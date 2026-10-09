import Link from "next/link";
import {
  Award, ChevronLeft, ChevronRight, Crown, Gift, Medal,
  MessageCircle, UserCheck, UserPlus, Users, Wallet,
} from "lucide-react";
import { fullDate, money, number } from "../appointments/format";
import CopyField from "./CopyField";
import RedeemButton from "./RedeemButton";
import { copy } from "./copy";
import { getLoyalty, getReferralInfo, getReferrals } from "./service";
import { TIERS, TIER_MIN } from "./types";
import s from "./referral.module.css";

const tierIcon = { bronze: Medal, silver: Award, gold: Crown } as const;
const statusTone = { pending: s.stPending, joined: s.stJoined, rewarded: s.stRewarded } as const;

type SearchParams = { page?: string };

export default async function ReferralPage({
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
  const requestedPage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const [loyalty, info, refs] = await Promise.all([
    getLoyalty(),
    getReferralInfo(),
    getReferrals(requestedPage, locale),
  ]);

  const pages = Math.max(1, Math.ceil(refs.total / refs.pageSize));
  const hasPrev = refs.page > 1;
  const hasNext = refs.page < pages;
  const pageHref = (p: number) =>
    `${prefix}/dashboard/referral${p > 1 ? `?page=${p}` : ""}`;

  const TierIcon = tierIcon[loyalty.tier];
  const nextText = loyalty.nextTier
    ? t.hero.toNext
        .replace("{n}", number(loyalty.pointsToNext, locale))
        .replace("{tier}", t.tiers[loyalty.nextTier])
    : t.hero.top;

  const shareText = t.share.text.replace("{link}", info.link);
  const waHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const stats = [
    { icon: Users, label: t.stats.invited, value: number(info.stats.invited, locale), tone: s.tPurple },
    { icon: UserCheck, label: t.stats.joined, value: number(info.stats.joined, locale), tone: s.tMint },
    { icon: Wallet, label: t.stats.earned, value: money(info.stats.earned, info.currency, locale), tone: s.tRose },
  ];

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h2>{t.title}</h2>
        <p>{t.subtitle}</p>
      </header>

      {/* ===== Loyalty card ===== */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <div>
            <span className={s.tierPill}>
              <TierIcon size={14} />
              {t.hero.tierLabel.replace("{tier}", t.tiers[loyalty.tier])}
            </span>
            <p className={s.ptsLabel}>{t.hero.label}</p>
            <p className={s.pts}>
              {number(loyalty.points, locale)} <small>{t.hero.points}</small>
            </p>
          </div>
          <RedeemButton t={t} locale={locale} balance={loyalty.points} />
        </div>

        <div className={s.progress}>
          <div
            className={s.bar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={loyalty.progress}
          >
            <div className={s.fill} style={{ width: `${loyalty.progress}%` }} />
          </div>
          <p>{nextText}</p>
        </div>

        <ol className={s.ladder}>
          {TIERS.map((tr) => {
            const Icon = tierIcon[tr];
            const state =
              tr === loyalty.tier ? s.ladderNow : loyalty.lifetimePoints >= TIER_MIN[tr] ? s.ladderDone : "";
            return (
              <li key={tr} className={`${s.ladderItem} ${state}`}>
                <Icon size={15} />
                <b>{t.tiers[tr]}</b>
                <small>{number(TIER_MIN[tr], locale)}+</small>
              </li>
            );
          })}
        </ol>

        <p className={s.rule}>{t.hero.earnRule}</p>
      </section>

      {/* ===== Stats ===== */}
      <section className={s.stats}>
        {stats.map((st) => {
          const Icon = st.icon;
          return (
            <div key={st.label} className={`${s.stat} ${st.tone}`}>
              <span className={s.statIcon}><Icon size={18} /></span>
              <b>{st.value}</b>
              <small>{st.label}</small>
            </div>
          );
        })}
      </section>

      <div className={s.layout}>
        {/* ===== Invite + how it works ===== */}
        <section className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelIcon}><Gift size={18} /></span>
            <div>
              <h2>{t.invite.title}</h2>
              <p>{t.invite.text}</p>
            </div>
          </div>

          <CopyField label={t.invite.code} value={info.code} copyLabel={t.copy} copiedLabel={t.copied} />
          <CopyField label={t.invite.link} value={info.link} copyLabel={t.copy} copiedLabel={t.copied} />

          <a href={waHref} target="_blank" rel="noopener noreferrer" className={s.waBtn}>
            <MessageCircle size={17} />
            {t.invite.whatsapp}
          </a>

          <div className={s.how}>
            <h3>{t.how.title}</h3>
            <ol>
              {t.how.steps.map((st, i) => (
                <li key={st.title}>
                  <span className={s.num}>{number(i + 1, locale)}</span>
                  <div>
                    <b>{st.title}</b>
                    <p>
                      {st.text
                        .replace("{you}", money(info.rewardForYou, info.currency, locale))
                        .replace("{friend}", money(info.rewardForFriend, info.currency, locale))}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ===== Referral history ===== */}
        <section className={s.panel}>
          <div className={s.panelHead}>
            <span className={s.panelIcon}><UserPlus size={18} /></span>
            <div>
              <h2>{t.history.title}</h2>
              <p>{number(refs.total, locale)} {t.history.results}</p>
            </div>
          </div>

          {refs.items.length === 0 ? (
            <div className={s.empty}>
              <span className={s.emptyIcon}><Users size={24} /></span>
              <h3>{t.history.empty.title}</h3>
              <p>{t.history.empty.text}</p>
            </div>
          ) : (
            <ul className={s.list}>
              {refs.items.map((r) => (
                <li key={r.id} className={s.item}>
                  <span className={s.avatar}>{r.name.charAt(0).toUpperCase()}</span>
                  <div className={s.itemText}>
                    <h3>{r.name}</h3>
                    <p dir="ltr">{r.contact}</p>
                    <small>{fullDate(r.createdAt, locale)}</small>
                  </div>
                  <div className={s.itemEnd}>
                    <span className={`${s.chip} ${statusTone[r.status]}`}>{t.history.status[r.status]}</span>
                    {r.reward !== undefined && (
                      <b dir="ltr" className={s.reward}>+{money(r.reward, r.currency, locale)}</b>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav className={s.pager} aria-label="Pagination">
              <Link
                href={pageHref(refs.page - 1)}
                scroll={false}
                aria-disabled={!hasPrev}
                className={`${s.pageBtn} ${!hasPrev ? s.pageBtnOff : ""}`}
              >
                <ChevronLeft size={16} className={s.rtlFlip} />
                {t.pager.prev}
              </Link>
              <span className={s.pageInfo}>
                {t.pager.page} {number(refs.page, locale)} {t.pager.of} {number(pages, locale)}
              </span>
              <Link
                href={pageHref(refs.page + 1)}
                scroll={false}
                aria-disabled={!hasNext}
                className={`${s.pageBtn} ${!hasNext ? s.pageBtnOff : ""}`}
              >
                {t.pager.next}
                <ChevronRight size={16} className={s.rtlFlip} />
              </Link>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}