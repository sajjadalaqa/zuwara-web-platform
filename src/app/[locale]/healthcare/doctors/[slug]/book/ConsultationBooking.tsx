"use client";
import { useUiText } from "@/i18n/use-ui-text";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import type { BookingDoctor, BookingInput } from "@/lib/api/zuwara/booking";
import { bookingPreviewError } from "@/lib/api/zuwara/booking-errors";
import { bookingConsultationOptions } from "@/lib/api/zuwara/booking-options";
import { slotsAction, previewAction, createBookingAction } from "./actions";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, UserRound, Stethoscope, Wallet, CreditCard, Check, ShieldCheck, Ticket, LoaderCircle } from "lucide-react";
import { doctorSlug } from "@/lib/api/zuwara/slugs";
import s from "./consultation-booking.module.css";
export default function ConsultationBooking({ doctor, dependents, today }: { doctor: BookingDoctor; dependents: number[]; today: string }) {
  const uiText = useUiText();
  const ar = useLocale() === "ar", router = useRouter();
  const [date, setDate] = useState(today), [duration, setDuration] = useState(doctor.duration_options[0]?.minutes ?? 0);
  const [time, setTime] = useState(""), [patient, setPatient] = useState<number | null>(null), [problem, setProblem] = useState("");
  const consultationTypes = bookingConsultationOptions(doctor.consultation_types);
  // Keep the API-required category using the first supported catalogue option.
  const type = consultationTypes[0] ?? "";
  const [method, setMethod] = useState<BookingInput["payment_method"]>("wallet");
  const [slots, setSlots] = useState<string[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [couponCode,setCouponCode]=useState("");
  const [quote, setQuote] = useState<{ token: string; payableHalalas: number; currency: string; breakdown?: { service:number;discount:number;subtotal:number;tax:number } } | null>(null);
  const [uncertain, setUncertain] = useState(false), request = useRef(0);
  const [slotLoading, setSlotLoading] = useState(true);
  useEffect(() => {
    let active = true; const sequence = ++request.current;
    Promise.resolve().then(() => { if (active) setSlotLoading(true); return slotsAction(doctor.id, date, duration); }).then(rows => { if (active && sequence === request.current) { setSlots(rows); setError(""); } })
      .catch(()=>{ if (active) { setSlots([]); setError(ar ? "تعذر تحميل المواعيد المتاحة." : uiText("Availability could not be loaded.")); } }).finally(() => { if (active) setSlotLoading(false); });
    return () => { active = false; };
  }, [doctor.id, date, duration, ar]);
  function changed() { setQuote(null); setTime(""); setSlots([]); setSlotLoading(true); setUncertain(false); }
  async function preview(e: React.FormEvent) {
    e.preventDefault(); if (busy || !time) return;
    if (!type || !consultationTypes.includes(type)) { setError(bookingPreviewError("VALIDATION_FAILED", ar, ["consultation_type"])); return; }
    if (!problem.trim()) { setError(bookingPreviewError("VALIDATION_FAILED", ar, ["problem"])); return; }
    setBusy(true); setError("");
    try {
      const result = await previewAction({ doctor_id: doctor.id, patient_id: patient, date, time, duration_minutes: duration, consultation_type: type, problem, payment_method: method, ...(couponCode.trim()?{coupon_code:couponCode.trim()}:{}) });
      if (!result.ok) {
        setQuote(null);
        setError(bookingPreviewError(result.code, ar, result.fields, result.typeHint));
        return;
      }
      setQuote(result.quote);
    } catch { setError(bookingPreviewError("API_UNAVAILABLE", ar)); }
    finally { setBusy(false); }
  }
  async function confirm() {
    if (!quote || busy) return; setBusy(true); setError("");
    try {
      const result = await createBookingAction(quote.token);
      if (!result.ok) {
        setUncertain(result.uncertain);
        if(!result.uncertain)setQuote(null);
        setError(ar ? "تعذر إتمام الحجز. تحقق من المواعيد والرصيد أو أعد محاولة الطلب نفسه." : "The booking could not complete. Check availability and balance, or retry the same request.");
        return;
      }
      try { sessionStorage.setItem("zuwara-created-appointment:" + result.booking.id, "1"); } catch { /* Booking remains successful if browser storage is unavailable. */ }
      router.push("/dashboard/appointments/" + result.booking.id + (result.booking.requiresPayment ? "/pay?method=" + result.booking.paymentMethod : ""));
      router.refresh();
    } catch { setUncertain(true); setError(ar ? "لم يتم تأكيد الحجز. أعد المحاولة بنفس الطلب أو تحقق من سجل المواعيد قبل بدء حجز جديد." : "The booking was not confirmed. Retry this request or check appointment history before starting another booking."); }
    finally { setBusy(false); }
  }
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const name = ar && doctor.name_ar ? doctor.name_ar : doctor.name;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("");
  const disabled = busy || uncertain;
  const money = (halalas: number, currency = "SAR") => new Intl.NumberFormat(ar ? "ar-SA" : "en-GB", {style:"currency", currency}).format(halalas / 100);
  const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory" : "en-GB", {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(date + "T12:00:00Z")) : t("Choose a date", "\u0627\u062e\u062a\u0631 \u062a\u0627\u0631\u064a\u062e\u0627\u064b");
  const timeLabel = (value: string) => {
    const hour = Number(value.slice(0, 2));
    return `${hour % 12 || 12}:${value.slice(2)} ${hour >= 12 ? "PM" : "AM"}`;
  };

  const paymentLabels = {wallet:t("Wallet", "\u0627\u0644\u0645\u062d\u0641\u0638\u0629"), myfatoorah:"MyFatoorah", tamara:"Tamara"};
  const profileHref = "/healthcare/doctors/" + doctorSlug(doctor.name, doctor.id);
  return (
    <main className={s.page} dir={ar ? "rtl" : "ltr"}>
      <div className={s.container}>
        <Link href={profileHref} className={s.back}><ArrowLeft size={16} className={s.directional}/>{t("Back to consultant", "\u0627\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a")}</Link>
        <header className={s.header}>
          <div><span className={s.eyebrow}>{t("YOUR NEXT STEP TO BETTER CARE", "\u062e\u0637\u0648\u062a\u0643 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0644\u0631\u0639\u0627\u064a\u0629 \u0623\u0641\u0636\u0644")}</span><h1>{t("Book your appointment", "\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0643")}</h1><p>{t("Choose a time that works for you. We will take care of the details.", "\u0627\u062e\u062a\u0631 \u0627\u0644\u0648\u0642\u062a \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0644\u0643 \u0648\u0623\u0643\u0645\u0644 \u062a\u0641\u0627\u0635\u064a\u0644 \u062d\u062c\u0632\u0643.")}</p></div>
          <div className={s.headerNote}><ShieldCheck size={19}/><span>{t("Secure booking", "\u062d\u062c\u0632 \u0622\u0645\u0646")}</span></div>
        </header>
        <ol className={s.progress} aria-label={t("Booking progress", "\u0645\u0631\u0627\u062d\u0644 \u0627\u0644\u062d\u062c\u0632")}>
          <li aria-current={!quote ? "step" : undefined}><span>{quote ? <Check size={15}/> : "01"}</span>{t("Appointment details", "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0639\u062f")}</li><li aria-current={quote ? "step" : undefined}><span>02</span>{t("Review & confirm", "\u0645\u0631\u0627\u062c\u0639\u0629 \u0648\u062a\u0623\u0643\u064a\u062f")}</li>
        </ol>
        <div className={s.layout}>
          <section className={s.card} aria-label={t("Appointment details", "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u0648\u0639\u062f")}>
            <form onSubmit={preview}>
              <section className={s.section}>
                <div className={s.sectionHead}><span className={s.sectionIcon}><CalendarDays size={20}/></span><div><h2>{t("Find your time", "\u0627\u062e\u062a\u0631 \u0648\u0642\u062a\u0643")}</h2><p>{t("Select your preferred date and consultation length.", "\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0648\u0645\u062f\u0629 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629.")}</p></div></div>
                <div className={s.two}>
                  <label className={s.field}>{t("Appointment date", "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u0648\u0639\u062f")}<input required type="date" min={today} value={date} disabled={disabled} onChange={e=>{changed();setDate(e.target.value);}}/></label>
                  <label className={s.field}>{t("Duration", "\u0627\u0644\u0645\u062f\u0629")}<select disabled={disabled} value={duration} onChange={e=>{changed();setDuration(Number(e.target.value));}}>{doctor.duration_options.map(d=><option key={d.minutes} value={d.minutes}>{d.minutes} {t("minutes", "\u062f\u0642\u064a\u0642\u0629")}</option>)}</select></label>
                </div>
                <div className={s.slotHeading}><span><Clock3 size={15}/>{t("Available times", "\u0627\u0644\u0623\u0648\u0642\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629")}</span><small>{t("Saudi Arabia time (UTC+3)", "\u062a\u0648\u0642\u064a\u062a \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629 (UTC+3)")}</small></div>
                {slotLoading ? <p className={s.slotMessage} role="status"><LoaderCircle size={16} className={s.spinner}/>{t("Finding available times...", "\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f...")}</p> : slots.length ? <div className={s.slots} role="group" aria-label={t("Available times", "\u0627\u0644\u0623\u0648\u0642\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629")} dir="ltr">{slots.map(value=><button key={value} type="button" disabled={disabled} aria-pressed={time===value} className={s.slot} onClick={()=>{setTime(value);setQuote(null);}}>{timeLabel(value)}{time===value && <Check size={13}/>}</button>)}</div> : <p className={s.slotMessage}>{t("No available times. Try another date or duration.", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0648\u0627\u0639\u064a\u062f \u0645\u062a\u0627\u062d\u0629. \u062c\u0631\u0628 \u062a\u0627\u0631\u064a\u062e\u0627\u064b \u0622\u062e\u0631.")}</p>}
              </section>
              <section className={s.section}>
                <div className={s.sectionHead}><span className={s.sectionIcon}><UserRound size={20}/></span><div><h2>{t("Who is this appointment for?", "\u0644\u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0645\u0648\u0639\u062f\u061f")}</h2><p>{t("Tell your consultant a little about your visit.", "\u0623\u062e\u0628\u0631 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a \u0639\u0646 \u0633\u0628\u0628 \u0627\u0644\u0632\u064a\u0627\u0631\u0629.")}</p></div></div>
                <label className={s.field}>{t("Patient", "\u0627\u0644\u0645\u0631\u064a\u0636")}<select disabled={disabled} value={patient ?? ""} onChange={e=>{setPatient(e.target.value ? Number(e.target.value) : null);setQuote(null);}}><option value="">{t("Myself", "\u0623\u0646\u0627")}</option>{dependents.map(id=><option key={id} value={id}>{t("Saved patient #", "\u0627\u0644\u0645\u0631\u064a\u0636 \u0627\u0644\u0645\u0633\u062c\u0644 #")}{id}</option>)}</select></label>
                {!type && <p className={s.slotMessage} role="status">{t("Booking options for this consultant are temporarily unavailable. Please choose another consultant or contact support.", "خيارات الحجز لهذا الاستشاري غير متاحة مؤقتاً. يرجى اختيار استشاري آخر أو التواصل مع الدعم.")}</p>}
                <label className={s.field}>{t("Explain your problem", "اشرح مشكلتك")}<textarea required maxLength={4000} rows={4} value={problem} disabled={disabled} placeholder={t("Describe your symptoms, concerns, or what you would like to discuss...", "\u0627\u0643\u062a\u0628 \u0627\u0644\u0623\u0639\u0631\u0627\u0636 \u0623\u0648 \u0645\u0627 \u062a\u0648\u062f \u0645\u0646\u0627\u0642\u0634\u062a\u0647...")} onChange={e=>{setProblem(e.target.value);setQuote(null);}}/><span className={s.fieldHint}>{t("Help your consultant prepare for your appointment.", "\u0633\u0627\u0639\u062f \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a \u0639\u0644\u0649 \u0627\u0644\u0627\u0633\u062a\u0639\u062f\u0627\u062f \u0644\u0645\u0648\u0639\u062f\u0643.")}</span></label>
              </section>
              <section className={s.section}>
                <div className={s.sectionHead}><span className={s.sectionIcon}><Wallet size={20}/></span><div><h2>{t("Payment details", "\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062f\u0641\u0639")}</h2><p>{t("Choose how you would like to pay.", "\u0627\u062e\u062a\u0631 \u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639.")}</p></div></div>
                <fieldset className={s.choiceGroup}><legend>{t("Payment method", "\u0637\u0631\u064a\u0642\u0629 \u0627\u0644\u062f\u0641\u0639")}</legend><div className={s.payments}>{(["wallet","myfatoorah","tamara"] as const).map(value=><label className={s.choice} key={value}><input type="radio" name="payment-method" value={value} checked={method===value} disabled={disabled} onChange={()=>{setMethod(value);setQuote(null);}}/>{value==="wallet" ? <Wallet size={19}/> : <CreditCard size={19}/>}<span>{paymentLabels[value]}</span><span className={s.radioMark}/></label>)}</div></fieldset>
                <label className={s.field}><span className={s.couponLabel}><Ticket size={15}/>{t("Coupon code", "\u0631\u0645\u0632 \u0627\u0644\u062e\u0635\u0645")}<small>{t("Optional", "\u0627\u062e\u062a\u064a\u0627\u0631\u064a")}</small></span><input maxLength={100} value={couponCode} disabled={disabled} placeholder={t("Enter your code", "\u0623\u062f\u062e\u0644 \u0627\u0644\u0631\u0645\u0632")} onChange={e=>{setCouponCode(e.target.value);setQuote(null);}}/></label>
              </section>
              <div className={s.formFoot}>
                {error && <p className={s.error} role="alert">{uiText(error)}</p>}
                <button type="submit" className={s.primary} disabled={busy || !time || !type || !consultationTypes.includes(type) || uncertain || slotLoading}>{busy ? <LoaderCircle size={18} className={s.spinner}/> : null}{busy ? t("Please wait...", "\u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631...") : t("Review appointment price", "\u0645\u0631\u0627\u062c\u0639\u0629 \u0633\u0639\u0631 \u0627\u0644\u0645\u0648\u0639\u062f")}<ArrowRight size={17} className={s.directional}/></button>
                <p className={s.footHint}>{t("Review the total before confirming your booking.", "\u0631\u0627\u062c\u0639 \u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0642\u0628\u0644 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632.")}</p>
              </div>
            </form>
          </section>
          <aside className={s.summary} aria-label={t("Booking summary", "\u0645\u0644\u062e\u0635 \u0627\u0644\u062d\u062c\u0632")}>
            <div className={s.summaryTop}><span className={s.summaryEyebrow}>{t("YOUR APPOINTMENT", "\u0645\u0648\u0639\u062f\u0643")}</span><h2>{t("Booking summary", "\u0645\u0644\u062e\u0635 \u0627\u0644\u062d\u062c\u0632")}</h2><div className={s.doctor}><span className={s.avatar}>{initials}</span><div><strong>{name}</strong><span><Stethoscope size={13}/>{t("Consultant", "\u0627\u0633\u062a\u0634\u0627\u0631\u064a")}</span></div></div></div>
            <div className={s.summaryBody}><dl className={s.details}>
              <div><dt><CalendarDays size={16}/>{t("Date", "\u0627\u0644\u062a\u0627\u0631\u064a\u062e")}</dt><dd>{dateLabel}</dd></div>
              <div><dt><Clock3 size={16}/>{t("Time", "\u0627\u0644\u0648\u0642\u062a")}</dt><dd>{time ? timeLabel(time) : t("Not selected", "\u0644\u0645 \u064a\u062a\u0645 \u0627\u0644\u0627\u062e\u062a\u064a\u0627\u0631")}</dd></div>
              <div><dt>{t("Duration", "\u0627\u0644\u0645\u062f\u0629")}</dt><dd>{duration} {t("minutes", "\u062f\u0642\u064a\u0642\u0629")}</dd></div>
              <div><dt>{t("Patient", "\u0627\u0644\u0645\u0631\u064a\u0636")}</dt><dd>{patient ? t("Saved patient #", "\u0627\u0644\u0645\u0631\u064a\u0636 #")+patient : t("Myself", "\u0623\u0646\u0627")}</dd></div>
              <div><dt>{t("Payment", "\u0627\u0644\u062f\u0641\u0639")}</dt><dd>{paymentLabels[method]}</dd></div>
            </dl>
            {quote ? <div className={s.quote} aria-live="polite">{quote.breakdown && <dl className={s.breakdown}>{([[t("Service", "\u0627\u0644\u062e\u062f\u0645\u0629"),quote.breakdown.service],[t("Discount", "\u0627\u0644\u062e\u0635\u0645"),-quote.breakdown.discount],[t("Subtotal", "\u0627\u0644\u0645\u062c\u0645\u0648\u0639"),quote.breakdown.subtotal],[t("Tax", "\u0627\u0644\u0636\u0631\u064a\u0628\u0629"),quote.breakdown.tax]] as [string,number][]).map(([label,amount])=><div key={label}><dt>{label}</dt><dd>{money(amount,quote.currency)}</dd></div>)}</dl>}<div className={s.total}><span>{t("Total to pay", "\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a")}</span><strong>{money(quote.payableHalalas,quote.currency)}</strong></div><button type="button" className={s.primary} disabled={busy} onClick={confirm}>{busy ? t("Please wait...", "\u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631...") : uncertain ? t("Retry this booking", "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629") : t("Confirm booking & pay", "\u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632 \u0648\u0627\u0644\u062f\u0641\u0639")}<ArrowRight size={16} className={s.directional}/></button></div> : <div className={s.priceHint}><Ticket size={18}/><p>{t("Your final price will appear here after you review your appointment.", "\u0633\u064a\u0638\u0647\u0631 \u0627\u0644\u0633\u0639\u0631 \u0627\u0644\u0646\u0647\u0627\u0626\u064a \u0647\u0646\u0627 \u0628\u0639\u062f \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0645\u0648\u0639\u062f.")}</p></div>}
            <div className={s.security}><ShieldCheck size={18}/><p>{t("Your time is reserved only after your booking is confirmed.", "\u064a\u062a\u0645 \u062d\u062c\u0632 \u0627\u0644\u0648\u0642\u062a \u0641\u0642\u0637 \u0628\u0639\u062f \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062d\u062c\u0632.")}</p></div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
