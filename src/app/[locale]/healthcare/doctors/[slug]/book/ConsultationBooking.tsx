"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { BookingDoctor, BookingInput } from "@/lib/api/zuwara/booking";
import { slotsAction, previewAction, createBookingAction } from "./actions";
import s from "@/app/[locale]/provider/[id]/book/booking.module.css";
export default function ConsultationBooking({ doctor, dependents, today }: { doctor: BookingDoctor; dependents: number[]; today: string }) {
  const ar = useLocale() === "ar", router = useRouter();
  const [date, setDate] = useState(today), [duration, setDuration] = useState(doctor.duration_options[0]?.minutes ?? 0);
  const [time, setTime] = useState(""), [patient, setPatient] = useState<number | null>(null), [problem, setProblem] = useState("");
  const [method, setMethod] = useState<BookingInput["payment_method"]>("wallet"), [type, setType] = useState(doctor.consultation_types[0] ?? "online");
  const [slots, setSlots] = useState<string[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [quote, setQuote] = useState<{ token: string; payableHalalas: number; currency: string } | null>(null);
  const [uncertain, setUncertain] = useState(false), request = useRef(0);
  useEffect(() => {
    let active = true; const sequence = ++request.current;
    slotsAction(doctor.id, date, duration).then(rows => { if (active && sequence === request.current) { setSlots(rows); setError(""); } })
      .catch(()=>{ if (active) { setSlots([]); setError(ar ? "تعذر تحميل المواعيد المتاحة." : "Availability could not be loaded."); } });
    return () => { active = false; };
  }, [doctor.id, date, duration, ar]);
  function changed() { setQuote(null); setTime(""); setUncertain(false); }
  async function preview(e: React.FormEvent) {
    e.preventDefault(); if (busy || !time) return; setBusy(true); setError("");
    try {
      const result = await previewAction({ doctor_id: doctor.id, patient_id: patient, date, time, duration_minutes: duration, consultation_type: type, problem, payment_method: method });
      if (!result.ok) throw new Error(); setQuote(result.quote);
    } catch { setError(ar ? "تعذر حساب السعر. تحقق من اختياراتك وحاول مجدداً." : "Unable to preview this booking. Check your selection and try again."); }
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
      router.push("/dashboard/appointments/" + result.booking.id + (result.booking.requiresPayment ? "/pay?method=" + result.booking.paymentMethod : ""));
      router.refresh();
    } catch { setUncertain(true); setError(ar ? "لم يتم تأكيد الحجز. أعد المحاولة بنفس الطلب أو تحقق من سجل المواعيد قبل بدء حجز جديد." : "The booking was not confirmed. Retry this request or check appointment history before starting another booking."); }
    finally { setBusy(false); }
  }
  return <main className={s.page}><div className={s.container}>
    <header className={s.head}><h1>{ar ? "احجز موعدك" : "Book your appointment"}</h1><p>{ar && doctor.name_ar ? doctor.name_ar : doctor.name}</p></header>
    <div className={s.layout}><section className={s.card}>
      <form onSubmit={preview} className={s.form}>
        <label>{ar ? "المدة" : "Duration"}<select disabled={busy || uncertain} value={duration} onChange={e=>{ changed(); setDuration(Number(e.target.value)); }}>{doctor.duration_options.map(d=><option key={d.minutes} value={d.minutes}>{d.minutes} {ar ? "دقيقة" : "minutes"}</option>)}</select></label>
        <label>{ar ? "التاريخ" : "Date"}<input type="date" min={today} value={date} disabled={busy || uncertain} onChange={e=>{ changed(); setDate(e.target.value); }} /></label>
        <div className={s.slots}>{slots.map(value=><button key={value} type="button" disabled={busy || uncertain} className={s.slot + (time === value ? " " + s.slotSel : "")} onClick={()=>{setTime(value);setQuote(null);}}>{value.slice(0,2)+":"+value.slice(2)}</button>)}</div>
        {!slots.length && <p>{ar ? "لا توجد أوقات متاحة لهذا الاختيار." : "No available times for this selection."}</p>}
        <label>{ar ? "المريض" : "Patient"}<select disabled={busy || uncertain} value={patient ?? ""} onChange={e=>{setPatient(e.target.value ? Number(e.target.value) : null);setQuote(null);}}><option value="">{ar ? "أنا" : "Myself"}</option>{dependents.map(id=><option key={id} value={id}>{ar ? "المريض المسجل #" : "Saved patient #"}{id}</option>)}</select></label>
        <label>{ar ? "نوع الاستشارة" : "Consultation type"}<select disabled={busy || uncertain} value={type} onChange={e=>{setType(e.target.value);setQuote(null);}}>{doctor.consultation_types.map(t=><option key={t} value={t}>{t === "online" ? ar ? "مرئية" : "Video consultation" : ar ? "حضورية" : "In person"}</option>)}</select></label>
        <label>{ar ? "ملاحظاتك" : "Your notes"}<textarea required maxLength={4000} value={problem} disabled={busy || uncertain} onChange={e=>{setProblem(e.target.value);setQuote(null);}} /></label>
        <label>{ar ? "طريقة الدفع" : "Payment method"}<select disabled={busy || uncertain} value={method} onChange={e=>{setMethod(e.target.value as BookingInput["payment_method"]);setQuote(null);}}><option value="wallet">{ar ? "المحفظة" : "Wallet"}</option><option value="myfatoorah">MyFatoorah</option><option value="tamara">Tamara</option></select></label>
        <button className={s.primary} disabled={busy || !time || uncertain}>{ar ? "مراجعة السعر" : "Review price"}</button>
      </form>
      {error && <p className={s.fail} role="alert">{error}</p>}
    </section><aside className={s.summary}>
      <h2>{ar ? "ملخص الحجز" : "Booking summary"}</h2><p>{doctor.name}</p><p>{date} {time ? time.slice(0,2)+":"+time.slice(2) : ""}</p>
      {quote && <><strong>{new Intl.NumberFormat(ar ? "ar-SA" : "en-GB", { style: "currency", currency: quote.currency }).format(quote.payableHalalas / 100)}</strong>
        <p>{ar ? "اختيار الوقت لا يحجزه حتى يؤكد الخادم الحجز." : "The selected time is not reserved until the server confirms the booking."}</p>
        <button className={s.primary} disabled={busy} onClick={confirm}>{busy ? ar ? "جارٍ المعالجة" : "Please wait" : uncertain ? ar ? "إعادة المحاولة" : "Retry this booking" : ar ? "تأكيد الحجز والدفع" : "Confirm booking and payment"}</button></>}
    </aside></div>
  </div></main>;
}

