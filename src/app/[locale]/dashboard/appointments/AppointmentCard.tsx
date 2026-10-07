import Link from "next/link";
import { Clock, Hash, Home, MapPin, Video, Zap } from "lucide-react";
import CancelButton from "./CancelButton";
import { dayNum, fullDate, money, monthShort, timeStr } from "./format";
import type { Copy } from "./copy";
import type { Appointment } from "./types";
import s from "./appointments.module.css";

const typeIcon = { consultation: Video, visit: Home, instant: Zap } as const;

const statusTone = {
  pending: s.stPending,
  accepted: s.stAccepted,
  completed: s.stCompleted,
  cancelled: s.stCancelled,
  declined: s.stDeclined,
} as const;

const payTone = {
  paid: s.payPaid,
  unpaid: s.payUnpaid,
  refunded: s.payRefunded,
} as const;

export default function AppointmentCard({
  a, t, locale, prefix,
}: {
  a: Appointment;
  t: Copy;
  locale: string;
  prefix: string;
}) {
  const TypeIcon = typeIcon[a.type];
  const cancellable = a.status === "pending" || a.status === "accepted";
  const initial = a.provider.name.replace(/^(Dr\.?|د\.)\s*/i, "").charAt(0).toUpperCase();

  return (
    <article className={s.card}>
      <div className={s.date} aria-label={fullDate(a.startsAt, locale)}>
        <b>{dayNum(a.startsAt, locale)}</b>
        <small>{monthShort(a.startsAt, locale)}</small>
      </div>

      <div className={s.body}>
        <div className={s.top}>
          <div className={s.who}>
            <span className={s.avatar}>
              {a.provider.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.provider.avatarUrl} alt="" />
              ) : (
                initial
              )}
            </span>
            <div className={s.whoText}>
              <h3>{a.provider.name}</h3>
              <p>{a.provider.specialty}</p>
            </div>
          </div>
          <span className={`${s.chip} ${statusTone[a.status]}`}>{t.status[a.status]}</span>
        </div>

        <div className={s.meta}>
          <span><TypeIcon size={14} />{t.types[a.type]}</span>
          <span><Clock size={14} />{timeStr(a.startsAt, locale)} · {a.durationMin} {t.min}</span>
          {a.address && <span><MapPin size={14} />{a.address}</span>}
          <span><Hash size={14} />{a.number}</span>
        </div>

        <div className={s.bottom}>
          <div className={s.price}>
            <b>{money(a.price, a.currency, locale)}</b>
            <span className={`${s.pay} ${payTone[a.paymentStatus]}`}>{t.payment[a.paymentStatus]}</span>
          </div>
          <div className={s.actions}>
            <Link href={`${prefix}/dashboard/appointments/${a.id}`} className={`${s.btn} ${s.btnGhost}`}>
              {t.details}
            </Link>
            {cancellable && (
              <CancelButton
                id={a.id}
                labels={{ cancel: t.cancel, ...t.dialog }}
                errors={t.errors}
              />
            )}
          </div>
        </div>
      </div>
    </article>
  );
}