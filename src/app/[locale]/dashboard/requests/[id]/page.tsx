import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, Banknote, CalendarClock, CalendarDays, Clock, FileText, Hash,
  Headset, Hourglass, MapPin, Plus, Star, UserCheck,
} from "lucide-react";
import { fullDate, money, number, timeStr } from "../../appointments/format";
import CancelRequestButton from "../CancelRequestButton";
import { categoryIcon } from "../categories";
import { copy } from "../copy";
import { getRequest } from "../service";
import AcceptOfferButton from "./AcceptOfferButton";
import { detailCopy } from "./detailCopy";
import s from "./detail.module.css";

const statusTone = {
  open: s.stOpen,
  in_progress: s.stProgress,
  completed: s.stDone,
  cancelled: s.stCancelled,
} as const;

const initialOf = (name: string) =>
  name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const t = isAr ? detailCopy.ar : detailCopy.en;
  const base = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const r = await getRequest(id, locale);
  if (!r) notFound();

  const Icon = categoryIcon[r.category];
  const isOpen = r.status === "open";
  const accepted = r.offers.find((o) => o.status === "accepted");
  const shown = isOpen ? r.offers : r.offers.filter((o) => o.status === "accepted");
  const stamp = (iso: string) => `${fullDate(iso, locale)} · ${timeStr(iso, locale)}`;
  const rating = new Intl.NumberFormat(isAr ? "ar-SA" : "en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const preferred = fullDate(`${r.preferredDate}T12:00:00Z`, locale);
  const budget = r.budget !== undefined ? money(r.budget, r.currency, locale) : t.notSet;

  const rows = [
    { icon: Hash, label: t.reference, value: r.number },
    { icon: Icon, label: t.category, value: base.categories[r.category] },
    { icon: MapPin, label: t.city, value: r.city },
    { icon: CalendarDays, label: t.preferred, value: preferred },
    { icon: Banknote, label: t.budget, value: budget },
    { icon: CalendarClock, label: t.posted, value: fullDate(r.createdAt, locale) },
  ];

  return (
    <div className={s.page}>
      <Link href={`${prefix}/dashboard/requests`} className={s.back}>
        <ArrowLeft size={16} className={s.rtlFlip} />
        {t.back}
      </Link>

      {/* ===== Hero ===== */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <span className={s.heroIcon}><Icon size={24} /></span>
          <div className={s.heroInfo}>
            <span className={`${s.chip} ${statusTone[r.status]}`}>{base.status[r.status]}</span>
            <h1>{r.title}</h1>
            <p>{base.categories[r.category]} · {r.number}</p>
          </div>
        </div>
        <div className={s.heroMeta}>
          <span className={s.pill}><MapPin size={13} />{r.city}</span>
          <span className={s.pill}><CalendarDays size={13} />{preferred}</span>
          <span className={s.pill}><Banknote size={13} />{budget}</span>
        </div>
      </section>

      <div className={s.layout}>
        {/* ===== Main column ===== */}
        <div className={s.main}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}><FileText size={17} /></span>
              <h2>{t.details}</h2>
            </div>
            <p className={s.desc}>{r.description}</p>
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}>
                {isOpen ? <Star size={17} /> : <UserCheck size={17} />}
              </span>
              <h2>{isOpen ? t.offers : t.yourProvider}</h2>
              {isOpen && r.offers.length > 0 && (
                <span className={s.countBadge}>{number(r.offers.length, locale)}</span>
              )}
            </div>

            {isOpen && r.offers.length > 0 && <p className={s.hint}>{t.offersHint}</p>}

            {shown.length === 0 ? (
              <div className={s.wait}>
                <span className={s.waitIcon}><Hourglass size={24} /></span>
                {r.status === "cancelled" ? (
                  <p>{t.cancelledNote}</p>
                ) : (
                  <>
                    <h3>{t.waiting.title}</h3>
                    <p>{t.waiting.text}</p>
                  </>
                )}
              </div>
            ) : (
              <div className={s.offerList}>
                {shown.map((o) => (
                  <article
                    key={o.id}
                    className={`${s.offer} ${o.status === "accepted" ? s.offerAccepted : ""}`}
                  >
                    <div className={s.offerTop}>
                      <span className={s.avatar}>
                        {o.provider.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={o.provider.avatarUrl} alt="" />
                        ) : (
                          initialOf(o.provider.name)
                        )}
                      </span>
                      <div className={s.offerWho}>
                        <h3>{o.provider.name}</h3>
                        <p>{o.provider.specialty}</p>
                      </div>
                      <span className={s.rating}>
                        <Star size={13} fill="currentColor" />
                        {rating.format(o.rating)}
                        <small>({number(o.reviewsCount, locale)})</small>
                      </span>
                    </div>

                    <p className={s.msg}>{o.message}</p>

                    <div className={s.offerBottom}>
                      <div className={s.price}>
                        <b>{money(o.price, o.currency, locale)}</b>
                        <small>
                          <Clock size={12} />
                          {t.available} {stamp(o.availableAt)}
                        </small>
                      </div>

                      {o.status === "accepted" ? (
                        <span className={s.acceptedTag}>{t.accepted}</span>
                      ) : (
                        isOpen && (
                          <AcceptOfferButton
                            requestId={r.id}
                            offerId={o.id}
                            providerName={o.provider.name}
                            price={money(o.price, o.currency, locale)}
                            labels={{ accept: t.accept, ...t.dialog }}
                            errors={base.errors}
                          />
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}><Clock size={17} /></span>
              <h2>{t.history}</h2>
            </div>
            <ol className={s.steps}>
              {r.timeline.map((step) => {
                const bad = step.key === "cancelled";
                const ok = step.key === "completed";
                return (
                  <li key={step.key} className={s.step}>
                    <span className={`${s.dot} ${bad ? s.dotBad : ok ? s.dotOk : ""}`} />
                    <div className={s.stepText}>
                      <b>{t.steps[step.key]}</b>
                      <small>{stamp(step.at)}</small>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        {/* ===== Side column ===== */}
        <aside className={s.side}>
          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>{t.summary}</h2>
            </div>
            <div className={s.rows}>
              {rows.map((row) => {
                const RowIcon = row.icon;
                return (
                  <div key={row.label} className={s.row}>
                    <span className={s.rowIcon}><RowIcon size={15} /></span>
                    <div className={s.rowText}>
                      <small>{row.label}</small>
                      <b>{row.value}</b>
                    </div>
                  </div>
                );
              })}
            </div>
            {accepted && r.agreedPrice !== undefined && (
              <div className={s.agreed}>
                <span>{t.agreed}</span>
                <b>{money(r.agreedPrice, r.currency, locale)}</b>
              </div>
            )}
          </section>

          <section className={s.card}>
            <div className={s.stack}>
              {isOpen ? (
                <CancelRequestButton id={r.id} t={base} />
              ) : (
                <Link href={`${prefix}/dashboard/requests/new`} className={s.actPrimary}>
                  <Plus size={16} />
                  {t.postSimilar}
                </Link>
              )}
            </div>
          </section>

          <section className={`${s.card} ${s.help}`}>
            <span className={s.cardIcon}><Headset size={17} /></span>
            <div>
              <h2>{t.helpTitle}</h2>
              <p>{t.helpText}</p>
              <Link href={`${prefix}/dashboard/help`} className={s.helpLink}>{t.helpBtn}</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}