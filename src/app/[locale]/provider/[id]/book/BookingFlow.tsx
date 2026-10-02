"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { submitBooking } from "./booking-api";
import styles from "./booking.module.css";

export type BookingProvider = {
  id: number | string;
  name: string;
  nameAr?: string;
  title?: string;
  titleAr?: string;
  image?: string;
};

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d={d} />
  </svg>
);
const I = {
  back: "M15 6l-6 6 6 6",
  prev: "M15 6l-6 6 6 6",
  next: "M9 6l6 6-6 6",
  home: "M3 11l9-8 9 8M5 10v10h14V10M10 20v-6h4v6",
  video: "M3 7h12v10H3zM15 11l6-3v8l-6-3",
  cal: "M4 6h16v14H4zM4 10h16M9 3v4M15 3v4",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2",
  check: "M5 12l5 5 9-10",
};

/* ---------- date helpers (strings, no timezone surprises) ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
type Ymd = { y: number; m: number; d: number };

const SLOTS = Array.from({ length: 18 }, (_, i) => {
  const mins = 9 * 60 + i * 30; // 09:00 to 17:30
  return { value: `${pad(Math.floor(mins / 60))}:${pad(mins % 60)}`, mins };
});

const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function BookingFlow({ provider }: { provider: BookingProvider }) {
  const t = useTranslations("bookPage");
  const locale = useLocale();
  const isAr = locale === "ar";
  const loc = isAr ? "ar-SA-u-ca-gregory-nu-latn" : "en-US";

  const name = isAr && provider.nameAr ? provider.nameAr : provider.name;
  const title = isAr && provider.titleAr ? provider.titleAr : provider.title;

  /* "today" is read on the client after mount to avoid server/client mismatch */
  const [today, setToday] = useState<(Ymd & { mins: number }) | null>(null);
  const [view, setView] = useState<{ y: number; m: number } | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [visitType, setVisitType] = useState<"home" | "virtual">("home");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const n = new Date();
    setToday({ y: n.getFullYear(), m: n.getMonth(), d: n.getDate(), mins: n.getHours() * 60 + n.getMinutes() });
    setView({ y: n.getFullYear(), m: n.getMonth() });
  }, []);

  useEffect(() => { cardRef.current?.scrollIntoView({ block: "start" }); }, [step]);

  const fmt = useMemo(() => ({
    month: new Intl.DateTimeFormat(loc, { month: "long", year: "numeric", timeZone: "UTC" }),
    weekday: new Intl.DateTimeFormat(loc, { weekday: "short", timeZone: "UTC" }),
    long: new Intl.DateTimeFormat(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    time: new Intl.DateTimeFormat(loc, { hour: "numeric", minute: "2-digit", timeZone: "UTC" }),
  }), [loc]);

  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => fmt.weekday.format(new Date(Date.UTC(2023, 0, 1 + i)))), // starts Sunday
    [fmt]
  );
  const timeLabel = (v: string) => {
    const [h, m] = v.split(":").map(Number);
    return fmt.time.format(new Date(Date.UTC(2000, 0, 1, h, m)));
  };
  const dateLabel = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    return fmt.long.format(new Date(Date.UTC(y, m - 1, d)));
  };

  const todayKey = today ? keyOf(today.y, today.m, today.d) : "";
  const maxKey = today
    ? (() => { const x = new Date(Date.UTC(today.y, today.m, today.d + 60)); return keyOf(x.getUTCFullYear(), x.getUTCMonth(), x.getUTCDate()); })()
    : "";

  const cells = useMemo(() => {
    if (!view) return [];
    const first = new Date(Date.UTC(view.y, view.m, 1)).getUTCDay();
    const count = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)] as (number | null)[];
  }, [view]);

  const canPrev = view && today ? view.y * 12 + view.m > today.y * 12 + today.m : false;
  const canNext = view && maxKey ? view.y * 12 + view.m < Number(maxKey.slice(0, 4)) * 12 + (Number(maxKey.slice(5, 7)) - 1) : false;
  const shift = (delta: number) => {
    if (!view) return;
    const total = view.y * 12 + view.m + delta;
    setView({ y: Math.floor(total / 12), m: total % 12 });
  };

  const slotDisabled = (mins: number) => Boolean(today && date === todayKey && mins < today.mins + 30);

  /* ---------- validation + submit ---------- */
  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = t("errRequired");
    if (!/^\+?[\d\s-]{7,}$/.test(phone.trim())) e.phone = t("errPhone");
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = t("errEmail");
    if (visitType === "home" && address.trim().length < 5) e.address = t("errRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = async () => {
    if (!date || !time || !validate()) return;
    setSending(true);
    setFailed(false);
    try {
      const res = await submitBooking({
        providerId: provider.id, date, time, visitType,
        fullName: fullName.trim(), phone: phone.trim(), email: email.trim(),
        address: visitType === "home" ? address.trim() : undefined,
        notes: notes.trim() || undefined,
      });
      if (res.ok) setStep(3); else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  };

  const visitLabel = visitType === "home" ? t("atHome") : t("virtual");
  const steps = [t("step1"), t("step2"), t("step3")];

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {step !== 3 && (
          <Link href={`/provider/${provider.id}`} className={styles.back}>
            <span className={styles.backIcon}><Svg d={I.back} size={16} /></span>
            {t("back")}
          </Link>
        )}

        <header className={styles.head}>
          <h1>{step === 3 ? t("successTitle") : t("title")}</h1>
          {step !== 3 && <p>{t("subtitle")}</p>}
        </header>

        <ol className={styles.steps} aria-label={t("progress")}>
          {steps.map((label, i) => {
            const n = i + 1;
            const state = step === n ? styles.cur : step > n ? styles.done : "";
            return (
              <li key={label} className={`${styles.stepItem} ${state}`} aria-current={step === n ? "step" : undefined}>
                <span className={styles.stepDot}>{step > n ? <Svg d={I.check} size={15} /> : n}</span>
                <span className={styles.stepLabel}>{label}</span>
              </li>
            );
          })}
        </ol>

        <div className={styles.layout}>
          <div className={styles.card} ref={cardRef}>
            {/* ---------------- STEP 1 ---------------- */}
            {step === 1 && (
              <>
                <h2 className={styles.h2}><Svg d={I.cal} /> {t("selectDate")}</h2>

                {!today || !view ? (
                  <div className={styles.skeleton} aria-hidden="true" />
                ) : (
                  <div className={styles.calendar}>
                    <div className={styles.calHead}>
                      <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t("prevMonth")}>
                        <span className={isAr ? styles.flip : ""}><Svg d={I.prev} size={18} /></span>
                      </button>
                      <strong>{fmt.month.format(new Date(Date.UTC(view.y, view.m, 1)))}</strong>
                      <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label={t("nextMonth")}>
                        <span className={isAr ? styles.flip : ""}><Svg d={I.next} size={18} /></span>
                      </button>
                    </div>
                    <div className={styles.weekdays}>{weekdays.map((w) => <span key={w}>{w}</span>)}</div>
                    <div className={styles.days}>
                      {cells.map((d, i) => {
                        if (d === null) return <span key={`e${i}`} />;
                        const k = keyOf(view.y, view.m, d);
                        const off = k < todayKey || k > maxKey;
                        return (
                          <button
                            key={k} type="button" disabled={off}
                            className={`${styles.day} ${k === date ? styles.daySel : ""} ${k === todayKey ? styles.dayToday : ""}`}
                            aria-pressed={k === date}
                            aria-label={dateLabel(k)}
                            onClick={() => { setDate(k); setTime(null); }}
                          >
                            {d}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <h2 className={`${styles.h2} ${styles.gap}`}><Svg d={I.clock} /> {t("selectTime")}</h2>
                {!date ? (
                  <p className={styles.hint}>{t("pickDateFirst")}</p>
                ) : (
                  <div className={styles.slots} role="group" aria-label={t("selectTime")}>
                    {SLOTS.map((s) => (
                      <button
                        key={s.value} type="button" disabled={slotDisabled(s.mins)}
                        className={`${styles.slot} ${time === s.value ? styles.slotSel : ""}`}
                        aria-pressed={time === s.value}
                        onClick={() => setTime(s.value)}
                      >
                        {timeLabel(s.value)}
                      </button>
                    ))}
                  </div>
                )}

                <div className={styles.actions}>
                  <button type="button" className={styles.primary} disabled={!date || !time} onClick={() => setStep(2)}>
                    {t("continue")}
                  </button>
                </div>
              </>
            )}

            {/* ---------------- STEP 2 ---------------- */}
            {step === 2 && (
              <>
                <h2 className={styles.h2}>{t("visitType")}</h2>
                <div className={styles.visit} role="radiogroup" aria-label={t("visitType")}>
                  {(["home", "virtual"] as const).map((v) => (
                    <label key={v} className={visitType === v ? styles.visitOn : ""}>
                      <input type="radio" name="visit" checked={visitType === v} onChange={() => setVisitType(v)} />
                      <span className={styles.visitIcon}><Svg d={v === "home" ? I.home : I.video} size={22} /></span>
                      <strong>{v === "home" ? t("atHome") : t("virtual")}</strong>
                      <small>{v === "home" ? t("atHomeHint") : t("virtualHint")}</small>
                    </label>
                  ))}
                </div>

                <h2 className={`${styles.h2} ${styles.gap}`}>{t("details")}</h2>
                <div className={styles.form}>
                  <Field label={t("fullName")} error={errors.fullName}>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" aria-invalid={!!errors.fullName} />
                  </Field>
                  <div className={styles.two}>
                    <Field label={t("phone")} error={errors.phone}>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" dir="ltr" inputMode="tel"
                        autoComplete="tel" placeholder="+966 5X XXX XXXX" aria-invalid={!!errors.phone} />
                    </Field>
                    <Field label={t("email")} error={errors.email}>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr"
                        autoComplete="email" aria-invalid={!!errors.email} />
                    </Field>
                  </div>
                  {visitType === "home" && (
                    <Field label={t("address")} error={errors.address}>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address"
                        placeholder={t("addressPh")} aria-invalid={!!errors.address} />
                    </Field>
                  )}
                  <Field label={t("notes")} hint={t("notesHint")}>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder={t("notesPh")} />
                  </Field>
                </div>

                {failed && <p className={styles.fail} role="alert">{t("errSubmit")}</p>}

                <div className={styles.actions}>
                  <button type="button" className={styles.ghost} onClick={() => setStep(1)} disabled={sending}>{t("backStep")}</button>
                  <button type="button" className={styles.primary} onClick={confirm} disabled={sending}>
                    {sending ? t("confirming") : t("confirm")}
                  </button>
                </div>
              </>
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {step === 3 && date && time && (
              <div className={styles.success}>
                <span className={styles.successIcon}><Svg d={I.check} size={34} /></span>
                <p>{t("successText", { name })}</p>
                <dl>
                  <div><dt>{t("date")}</dt><dd>{dateLabel(date)}</dd></div>
                  <div><dt>{t("time")}</dt><dd>{timeLabel(time)}</dd></div>
                  <div><dt>{t("visit")}</dt><dd>{visitLabel}</dd></div>
                </dl>
                <div className={styles.actions}>
                  <Link href={`/provider/${provider.id}`} className={styles.ghostLink}>{t("backToProvider")}</Link>
                  <Link href="/" className={styles.primaryLink}>{t("goHome")}</Link>
                </div>
              </div>
            )}
          </div>

          {/* ---------------- SUMMARY ---------------- */}
          {step !== 3 && (
            <aside className={styles.summary}>
              <div className={styles.sumHead}>
                <div className={styles.avatar}>
                  {provider.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={provider.image} alt={name} />
                  ) : (
                    <span aria-hidden="true">{initials(name)}</span>
                  )}
                </div>
                <div>
                  <strong>{name}</strong>
                  {title && <span>{title}</span>}
                </div>
              </div>
              <h3>{t("summary")}</h3>
              <dl>
                <div><dt>{t("date")}</dt><dd>{date ? dateLabel(date) : t("notSelected")}</dd></div>
                <div><dt>{t("time")}</dt><dd>{time ? timeLabel(time) : t("notSelected")}</dd></div>
                <div><dt>{t("visit")}</dt><dd>{visitLabel}</dd></div>
              </dl>
              <p className={styles.emergency}>{t("emergency")}</p>
            </aside>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className={`${styles.field} ${error ? styles.fieldErr : ""}`}>
      <span>{label}</span>
      {children}
      {error ? <em role="alert">{error}</em> : hint ? <small>{hint}</small> : null}
    </label>
  );
}