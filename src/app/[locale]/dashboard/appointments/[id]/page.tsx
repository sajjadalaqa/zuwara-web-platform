import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CalendarPlus, Clock, CreditCard, FileText, Hash, Headset,
  Home, MapPin, Star, Timer, Video, Zap,
} from "lucide-react";
import CancelButton from "../CancelButton";
import { copy } from "../copy";
import { dayNum, fullDate, money, monthShort, timeStr } from "../format";
import { getAppointment } from "../service";
import JoinButton from "./JoinButton";
import { detailCopy } from "./detailCopy";
import s from "./detail.module.css";

const typeIcon = { consultation: Video, visit: Home, instant: Zap } as const;

const statusTone = {
  pending: s.stPending,
  accepted: s.stAccepted,
  completed: s.stCompleted,
  cancelled: s.stCancelled,
  declined: s.stDeclined,
} as const;

const payTone = { paid: s.payPaid, unpaid: s.payUnpaid, refunded: s.payRefunded } as const;

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const t = isAr ? detailCopy.ar : detailCopy.en;
  const base = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";

  const a = await getAppointment(id, locale);
  if (!a) notFound();

  const TypeIcon = typeIcon[a.type];
  const cancellable = a.status === "pending" || a.status === "accepted";
  const hasCall = a.type !== "visit" && a.status === "accepted";
  const canReview = a.status === "completed";
  const initial = a.provider.name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();
  const stamp = (iso: string) => `${fullDate(iso, locale)} · ${timeStr(iso, locale)}`;

  const rows = [
    { icon: Hash, label: t.reference, value: a.number },
    { icon: TypeIcon, label: t.type, value: base.types[a.type] },
    { icon: Timer, label: t.duration, value: `${a.durationMin} ${t.min}` },
    ...(a.address ? [{ icon: MapPin, label: t.location, value: a.address }] : []),
    ...(a.notes ? [{ icon: FileText, label: t.notes, value: a.notes }] : []),
  ];

  return (
    <div className={s.page}>
      <Link href={`${prefix}/dashboard/appointments`} className={s.back}>
        <ArrowLeft size={16} className={s.rtlFlip} />
        {t.back}
      </Link>

      {/* ===== Hero ===== */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <div className={s.heroDate}>
            <b>{dayNum(a.startsAt, locale)}</b>
            <small>{monthShort(a.startsAt, locale)}</small>
          </div>
          <div className={s.heroInfo}>
            <span className={`${s.chip} ${statusTone[a.status]}`}>{base.status[a.status]}</span>
            <h1>{fullDate(a.startsAt, locale)}</h1>
            <p>
              <Clock size={14} />
              {timeStr(a.startsAt, locale)} · {a.durationMin} {t.min}
            </p>
          </div>
        </div>

        <div className={s.provider}>
          <span className={s.avatar}>
            {a.provider.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.provider.avatarUrl} alt="" />
            ) : (
              initial
            )}
          </span>
          <div>
            <h2>{a.provider.name}</h2>
            <p>{a.provider.specialty}</p>
          </div>
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
            <div className={s.rows}>
              {rows.map((r) => {
                const Icon = r.icon;
                return (
                  <div key={r.label} className={s.row}>
                    <span className={s.rowIcon}><Icon size={15} /></span>
                    <div className={s.rowText}>
                      <small>{r.label}</small>
                      <b>{r.value}</b>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasCall && (
              <div className={s.joinBox}>
                <JoinButton
                  startsAt={a.startsAt}
                  durationMin={a.durationMin}
                  url={a.meetingUrl}
                  labels={{ join: t.join, soon: t.joinSoon, ended: t.joinEnded, none: t.joinNone }}
                />
              </div>
            )}
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardIcon}><Clock size={17} /></span>
              <h2>{t.history}</h2>
            </div>
            <ol className={s.steps}>
              {a.timeline.map((step) => {
                const bad = step.key === "cancelled" || step.key === "declined";
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
              <span className={s.cardIcon}><CreditCard size={17} /></span>
              <h2>{t.payment}</h2>
              <span className={`${s.pay} ${payTone[a.paymentStatus]}`}>
                {base.payment[a.paymentStatus]}
              </span>
            </div>
            <div className={s.sum}>
              <div className={s.sumRow}><span>{t.method}</span><b>{a.payment.method}</b></div>
              <div className={s.sumRow}>
                <span>{t.subtotal}</span>
                <b>{money(a.payment.subtotal, a.currency, locale)}</b>
              </div>
              <div className={s.sumRow}>
                <span>{t.fee}</span>
                <b>{money(a.payment.fee, a.currency, locale)}</b>
              </div>
              <div className={`${s.sumRow} ${s.sumTotal}`}>
                <span>{t.total}</span>
                <b>{money(a.payment.total, a.currency, locale)}</b>
              </div>
              {a.payment.paidAt && (
                <p className={s.paidOn}>{t.paidOn} {stamp(a.payment.paidAt)}</p>
              )}
            </div>
          </section>

          <section className={s.card}>
            <div className={s.cardHead}>
              <h2>{t.actions}</h2>
            </div>
            <div className={s.stack}>
              {canReview && (
                <Link href={`${prefix}/dashboard/reviews`} className={s.actPrimary}>
                  <Star size={16} />
                  {t.review}
                </Link>
              )}
              {!cancellable && (
                <Link href={`${prefix}/provider`} className={canReview ? s.actGhost : s.actPrimary}>
                  <CalendarPlus size={16} />
                  {t.rebook}
                </Link>
              )}
              {cancellable && (
                <CancelButton
                  id={a.id}
                  labels={{ cancel: base.cancel, ...base.dialog }}
                  errors={base.errors}
                />
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