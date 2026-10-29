"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { homeSlotsAction, previewHomeAction, createHomeAction, payHomeAction } from "./booking-api";
import type { HomeService, HomeAddress, HomeGroup } from "@/lib/api/d4h/bookings";
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



const initials = (n: string) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

export default function BookingFlow({ provider, services, addresses, identity }: { provider: BookingProvider; services: HomeService[]; addresses: HomeAddress[]; identity: { name: string; phone: string; email: string } }) {
  const uiText = useUiText();
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
  const [fullName, setFullName] = useState(identity.name);
  const [phone, setPhone] = useState(identity.phone);
  const [email, setEmail] = useState(identity.email);

  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [serviceId, setServiceId] = useState(services[0]?.id ?? 0);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? 0);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [slotError, setSlotError] = useState(false);
  const [quote, setQuote] = useState<{token:string;amountHalalas:number}|null>(null);
  const [group, setGroup] = useState<HomeGroup|null>(null);
  const [locked, setLocked] = useState(false);
  const SLOTS = availableSlots.map(value => ({value,mins:Number(value.slice(0,2))*60+Number(value.slice(3,5))}));
  useEffect(()=>{
    if (!date || !serviceId) return;
    let active=true;
    Promise.resolve().then(()=>{
      if(active){setSlotLoading(true);setSlotError(false);setAvailableSlots([]);}
      return homeSlotsAction(Number(provider.id),serviceId,date);
    }).then(rows=>{if(active){setAvailableSlots(rows);setSlotError(false);}})
      .catch(()=>{if(active){setAvailableSlots([]);setSlotError(true);}})
      .finally(()=>{if(active)setSlotLoading(false);});
    return()=>{active=false;};
  },[provider.id,serviceId,date]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const n = new Date();
      setToday({ y: n.getFullYear(), m: n.getMonth(), d: n.getDate(), mins: n.getHours() * 60 + n.getMinutes() });
      setView({ y: n.getFullYear(), m: n.getMonth() });
    });
    return () => cancelAnimationFrame(frame);
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
  const noSlots = Boolean(date) && !slotLoading && SLOTS.every((s) => slotDisabled(s.mins));
  const goToday = () => {
    if (!today) return;
    setView({ y: today.y, m: today.m });
    setDate(todayKey);
    setTime(null);
  };

  /* ---------- validation + submit ---------- */
  const validate = () => {
    const e: Record<string, string> = {};
    if (fullName.trim().length < 2) e.fullName = t("errRequired");
    if (!/^\+?[\d\s-]{7,}$/.test(phone.trim())) e.phone = t("errPhone");
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) e.email = t("errEmail");
    if (visitType === "home" && !addresses.some(a=>a.id===addressId)) e.address = t("errRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const confirm = async () => {
    if (!date || !time || !validate() || sending) return;
    setSending(true); setFailed(false);
    try {
      if (!quote) {
        const result=await previewHomeAction({providerId:Number(provider.id),serviceId,addressId,date,time,notes});
        if(!result.ok)throw new Error(uiText("Visit preview unavailable"));
        setQuote(result.quote);return;
      }
      setLocked(true);
      const result=await createHomeAction(quote.token);
      if(!result.ok){if(!result.uncertain){setLocked(false);setQuote(null);}setFailed(true);return;}
      setGroup(result.group);setStep(3);
    }catch{setFailed(true);}finally{setSending(false);}
  };
  const pay = async () => {
    if(!group || sending || group.paid)return;
    setSending(true);setFailed(false);
    try{
      const result=await payHomeAction(group.id);
      if(!result.ok || !result.paid)throw new Error(uiText("Payment verification pending"));
      setGroup({...group,paid:true});
    }catch{setFailed(true);}finally{setSending(false);}
  };
  const visitLabel = t("atHome");
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
          <h1>{step === 3 ? group?.paid ? t("successTitle") : isAr ? "متابعة دفع الزيارة" : "Complete visit payment" : t("title")}</h1>
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
                <div className={styles.form}><Field label={isAr ? "الخدمة" : "Service"}>
                  <select value={serviceId} disabled={locked || !services.length} onChange={e=>{setServiceId(Number(e.target.value));setTime(null);setQuote(null);}}>
                    {!services.length && <option value={0}>{isAr ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u062e\u062f\u0645\u0627\u062a \u0645\u062a\u0627\u062d\u0629" : "No services available"}</option>}
                    {services.map(service=><option key={service.id} value={service.id}>{isAr && service.nameAr ? service.nameAr : service.name}</option>)}
                  </select>
                </Field></div>
                {(!services.length || !addresses.length) && <div className={styles.availabilityNotice} role="status">
                  <Svg d={I.cal} size={20}/>
                  <div><strong>{isAr ? "\u0627\u0644\u062d\u062c\u0632 \u063a\u064a\u0631 \u0645\u062a\u0627\u062d \u062d\u0627\u0644\u064a\u0627\u064b" : "Booking is not available yet"}</strong>
                    <p>{!services.length
                      ? isAr ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u062e\u062f\u0645\u0627\u062a \u0645\u062a\u0627\u062d\u0629 \u0644\u0644\u062d\u062c\u0632 \u0644\u062f\u0649 \u0645\u0642\u062f\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u062d\u0627\u0644\u064a\u0627\u064b." : "This provider has no home-visit services available. Available times will appear once a service is listed."
                      : isAr ? "\u0623\u0636\u0641 \u0639\u0646\u0648\u0627\u0646\u0643 \u0641\u064a \u062a\u0637\u0628\u064a\u0642 \u0632\u0648\u0627\u0631\u0629 \u0644\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0623\u0648 \u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645." : "A saved address is required. Add your address in Zuwara Visit or contact support to continue."}</p>
                    <Link href={!services.length ? "/provider" : "/contact"}>{!services.length ? isAr ? "\u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u0642\u062f\u0645\u064a \u0627\u0644\u062e\u062f\u0645\u0629" : "Browse other providers" : isAr ? "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639 \u0627\u0644\u062f\u0639\u0645" : "Contact support"}</Link>
                  </div>
                </div>}
                <div className={styles.pick}>
                  {/* Date */}
                  <section className={styles.pickCol} aria-label={t("selectDate")}>
                    <div className={styles.colHead}>
                      <div>
                        <h2><Svg d={I.cal} size={16} /> {t("selectDate")}</h2>
                      </div>
                      <button type="button" className={styles.todayBtn} onClick={goToday} disabled={!today}>
                        {t("today")}
                      </button>
                    </div>

                    {!today || !view ? (
                      <div className={styles.skeleton} aria-hidden="true" />
                    ) : (
                      <div className={styles.calendar}>
                        <div className={styles.calHead}>
                          <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t("prevMonth")}>
                            <span className={isAr ? styles.flip : ""}><Svg d={I.prev} size={16} /></span>
                          </button>
                          <strong>{fmt.month.format(new Date(Date.UTC(view.y, view.m, 1)))}</strong>
                          <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label={t("nextMonth")}>
                            <span className={isAr ? styles.flip : ""}><Svg d={I.next} size={16} /></span>
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
                                onClick={() => { setDate(k); setTime(null); setQuote(null); }}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Time */}
                  <section className={styles.pickCol} aria-label={t("selectTime")}>
                    <div className={styles.colHead}>
                      <div>
                        <h2><Svg d={I.clock} size={16} /> {t("selectTime")}</h2>
                        {date && <p>{dateLabel(date)}</p>}
                      </div>
                    </div>

                    {!serviceId ? (
                      <p className={styles.hint}>{isAr ? "\u0644\u0627 \u062a\u062a\u0648\u0641\u0631 \u0623\u0648\u0642\u0627\u062a \u0644\u0644\u062d\u062c\u0632 \u0628\u062f\u0648\u0646 \u062e\u062f\u0645\u0629 \u0645\u062a\u0627\u062d\u0629." : "Available times require a bookable service from this provider."}</p>
                    ) : !date ? (
                      <p className={styles.hint}>{t("pickDateFirst")}</p>
                    ) : slotError ? (<p className={styles.fail} role="alert">{isAr ? "تعذر تحميل الأوقات المتاحة. أعد المحاولة." : "Availability could not be loaded. Please retry."}</p>) : slotLoading ? (<p className={styles.hint}>{isAr ? "جارٍ تحميل الأوقات" : "Loading available times"}</p>) : noSlots ? (
                      <p className={styles.hint}>{t("noSlots")}</p>
                    ) : (
                      <div className={styles.slots} role="group" aria-label={t("selectTime")}>
                        {SLOTS.map((s) => (
                          <button
                            key={s.value} type="button" disabled={slotDisabled(s.mins)}
                            className={`${styles.slot} ${time === s.value ? styles.slotSel : ""}`}
                            aria-pressed={time === s.value}
                            onClick={() => {setTime(s.value);setQuote(null);}}
                          >
                            {timeLabel(s.value)}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.primary} disabled={!date || !time || !services.length || !addresses.length} onClick={() => setStep(2)}>
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
                  {(["home"] as const).map((v) => (
                    <label key={v} className={visitType === v ? styles.visitOn : ""}>
                      <input disabled={locked} type="radio" name="visit" checked={visitType === v} onChange={() => setVisitType(v)} />
                      <span className={styles.visitIcon}><Svg d={I.home} size={22} /></span>
                      <strong>{t("atHome")}</strong>
                      <small>{t("atHomeHint")}</small>
                    </label>
                  ))}
                </div>

                <h2 className={`${styles.h2} ${styles.gap}`}>{t("details")}</h2>
                <div className={styles.form}>
                  <Field label={t("fullName")} error={errors.fullName}>
                    <input readOnly disabled={locked} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" aria-invalid={!!errors.fullName} />
                  </Field>
                  <div className={styles.two}>
                    <Field label={t("phone")} error={errors.phone}>
                      <input readOnly disabled={locked} value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" dir="ltr" inputMode="tel"
                        autoComplete="tel" placeholder="+966 5X XXX XXXX" aria-invalid={!!errors.phone} />
                    </Field>
                    <Field label={t("email")} error={errors.email}>
                      <input readOnly disabled={locked} value={email} onChange={(e) => setEmail(e.target.value)} type="email" dir="ltr"
                        autoComplete="email" aria-invalid={!!errors.email} />
                    </Field>
                  </div>
                  {visitType === "home" && (
                    <Field label={t("address")} error={errors.address}>
                      <select disabled={locked} value={addressId} onChange={e=>{setAddressId(Number(e.target.value));setQuote(null);}}>
                        {addresses.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}
                      </select>
                    </Field>
                  )}
                  <Field label={t("notes")} hint={t("notesHint")}>
                    <textarea disabled={locked} maxLength={4000} value={notes} onChange={(e) => {setNotes(e.target.value);setQuote(null);}} rows={4} placeholder={t("notesPh")} />
                  </Field>
                </div>

                {failed && <p className={styles.fail} role="alert">{t("errSubmit")}</p>}

                <div className={styles.actions}>
                  <button type="button" className={styles.ghost} onClick={() => setStep(1)} disabled={sending || locked}>{t("backStep")}</button>
                  <button type="button" className={styles.primary} onClick={confirm} disabled={sending}>
                    {sending ? t("confirming") : locked ? isAr ? "إعادة محاولة الحجز نفسه" : "Retry this visit" : quote ? isAr ? "إنشاء الزيارة" : "Create visit" : isAr ? "مراجعة السعر" : "Review price"}
                  </button>
                </div>
              </>
            )}

            {/* ---------------- STEP 3 ---------------- */}
            {step === 3 && group && (
              <div className={styles.success}>
                <span className={styles.successIcon}><Svg d={I.check} size={34} /></span>
                <p>{group.paid ? t("successText", { name }) : isAr ? "تم إنشاء الزيارة. أكمل الدفع من المحفظة لتأكيدها." : "The visit was created. Complete wallet payment to confirm it."}</p>
                <strong>{new Intl.NumberFormat(isAr?"ar-SA":"en-GB",{style:"currency",currency:"SAR"}).format(group.amountHalalas/100)}</strong>
                <p>{isAr ? "مرجع الزيارة: " : "Visit reference: "}{group.id}</p>
                {!group.paid && <button className={styles.primary} disabled={sending} onClick={pay}>{sending ? t("confirming") : isAr ? "الدفع من المحفظة" : "Pay from wallet"}</button>}
                {failed && <p className={styles.fail} role="alert">{isAr ? "لم يتم تأكيد الدفع. أعد المحاولة لنفس الزيارة ولا تنشئ زيارة جديدة." : "Payment is not confirmed. Retry this same visit; do not create another booking."}</p>}
                <Link href={"/provider/"+provider.id} className={styles.ghostLink}>{t("backToProvider")}</Link>
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
              {quote && <p>{isAr ? "السعر التقديري: " : "Quoted total: "}{new Intl.NumberFormat(isAr?"ar-SA":"en-GB",{style:"currency",currency:"SAR"}).format(quote.amountHalalas/100)}</p>}
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
