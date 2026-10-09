import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, CalendarClock, CalendarDays, Clock, Hash, Headset, MessageSquare, Plus, Tag,
} from "lucide-react";
import { fullDate, timeStr } from "../../appointments/format";
import { categoryIcon } from "../categories";
import { copy } from "../copy";
import { getComplaint } from "../service";
import ReplyForm from "./ReplyForm";
import s from "../complaints.module.css";

const statusTone = {
  open: s.stOpen,
  in_review: s.stReview,
  resolved: s.stResolved,
  closed: s.stClosed,
} as const;

export default async function ComplaintDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const isAr = locale === "ar";
  const base = isAr ? copy.ar : copy.en;
  const t = base.detail;
  const prefix = isAr ? "/ar" : "";

  const c = await getComplaint(id, locale);
  if (!c) notFound();

  const Icon = categoryIcon[c.category];
  const canReply = c.status === "open" || c.status === "in_review";
  const stamp = (iso: string) => `${fullDate(iso, locale)} · ${timeStr(iso, locale)}`;

  // The original description is the first message of the conversation.
  const thread = [
    { id: "original", from: "you" as const, body: c.description, createdAt: c.createdAt },
    ...c.messages,
  ];

  const rows = [
    { icon: Hash, label: t.reference, value: c.number },
    { icon: Tag, label: t.category, value: base.categories[c.category] },
    ...(c.relatedRef ? [{ icon: Hash, label: t.related, value: c.relatedRef }] : []),
    { icon: CalendarDays, label: t.submitted, value: fullDate(c.createdAt, locale) },
    { icon: CalendarClock, label: t.updated, value: fullDate(c.updatedAt, locale) },
  ];

  return (
    <div className={s.page}>
      <Link href={`${prefix}/dashboard/complaints`} className={s.back}>
        <ArrowLeft size={16} className={s.rtlFlip} />
        {t.back}
      </Link>

      {/* ===== Hero ===== */}
      <section className={s.hero}>
        <div className={s.heroTop}>
          <span className={s.heroIcon}><Icon size={24} /></span>
          <div className={s.heroInfo}>
            <span className={`${s.chip} ${statusTone[c.status]}`}>{base.status[c.status]}</span>
            <h1>{c.subject}</h1>
            <p>{base.categories[c.category]} · {c.number}</p>
          </div>
        </div>
      </section>

      <div className={s.layout}>
        {/* ===== Main column ===== */}
        <div className={s.main}>
          <section className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelIcon}><MessageSquare size={17} /></span>
              <h2>{t.conversation}</h2>
            </div>

            <ol className={s.thread}>
              {thread.map((m) => (
                <li
                  key={m.id}
                  className={`${s.msg} ${m.from === "you" ? s.msgMe : s.msgThem}`}
                >
                  <div className={s.msgHead}>
                    <b>{m.from === "you" ? t.you : t.support}</b>
                    <small>{stamp(m.createdAt)}</small>
                  </div>
                  <div className={s.msgBody}>{m.body}</div>
                </li>
              ))}
            </ol>
          </section>

          {canReply ? (
            <section className={s.panel}>
              <div className={s.panelHead}>
                <h2>{t.replyTitle}</h2>
              </div>
              <ReplyForm
                complaintId={c.id}
                t={base}
              />
            </section>
          ) : (
            <p className={s.note}>{t.closedNote}</p>
          )}
        </div>

        {/* ===== Side column ===== */}
        <aside className={s.side}>
          <section className={s.panel}>
            <div className={s.panelHead}>
              <h2>{t.summary}</h2>
            </div>
            <div className={s.rows}>
              {rows.map((r) => {
                const RowIcon = r.icon;
                return (
                  <div key={r.label} className={s.row}>
                    <span className={s.rowIcon}><RowIcon size={15} /></span>
                    <div className={s.rowText}>
                      <small>{r.label}</small>
                      <b>{r.value}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={s.panel}>
            <div className={s.panelHead}>
              <span className={s.panelIcon}><Clock size={17} /></span>
              <h2>{t.history}</h2>
            </div>
            <ol className={s.steps}>
              {c.timeline.map((step) => (
                <li key={step.key} className={s.step}>
                  <span className={`${s.dot} ${step.key === "resolved" || step.key === "closed" ? s.dotOk : ""}`} />
                  <div className={s.stepText}>
                    <b>{t.steps[step.key]}</b>
                    <small>{stamp(step.at)}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={s.panel}>
            <Link href={`${prefix}/dashboard/complaints/new`} className={s.actPrimary}>
              <Plus size={16} />
              {t.another}
            </Link>
          </section>

          <section className={`${s.panel} ${s.help}`}>
            <span className={s.panelIcon}><Headset size={17} /></span>
            <div>
              <h2>{t.helpTitle}</h2>
              <p>{t.helpText}</p>
              <Link href={`${prefix}/dashboard/help#contact`} className={s.helpLink}>{t.helpBtn}</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}