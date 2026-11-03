"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Script from "next/script";
import { Zap, Users, UserRound, ShieldCheck, Clock3, History, RefreshCw, ArrowUpRight, CalendarCheck2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { V2Envelope } from "@/lib/api/zuwara/v2";
import type { InstantRequest, InstantSettings, InstantInput, InstantType, PaymentMethod, HistoryCard, Pricing, InstantCheckout } from "@/lib/api/zuwara/instant";
import type { ZuwaraCategory } from "@/lib/api/zuwara/types";
import { instantErrorMessage } from "@/lib/api/zuwara/instant-errors";
import { statusAction, historyAction, previewAction, createAction, payAction, cancelAction, checkoutAction } from "./actions";
import s from "./instant.module.css";
const terminal = new Set(["accepted", "declined_all", "expired", "cancelled"]);
type Operation = { name: "create" | "pay" | "cancel"; type: InstantType; input: InstantInput; uuid?: string; key: string };
export default function InstantFlow({ locale, identity, settings, initial, history: initialHistory, categories, consultants, dependents, selectedDoctor, cardEnabled }: {
  locale: string; identity: string; settings: InstantSettings; initial: V2Envelope<InstantRequest | null>; history: V2Envelope<HistoryCard[]>;
  categories: ZuwaraCategory[]; consultants: { id: number; name: string }[]; dependents: { id: number; name: string }[]; selectedDoctor: string; cardEnabled: boolean;
}) {
  const ar = locale === "ar", t = (en: string, arabic: string) => ar ? arabic : en;
  const [response, setResponse] = useState(initial), [history, setHistory] = useState(initialHistory);
  const [type, setType] = useState<InstantType>(selectedDoctor ? "private" : "public");
  const [doctor, setDoctor] = useState(selectedDoctor), [duration, setDuration] = useState(String(settings.durations[0]?.id ?? ""));
  const [communication, setCommunication] = useState<"video" | "audio" | "chat">("video");
  const [problem, setProblem] = useState(""), [category, setCategory] = useState("");
  const [patient, setPatient] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("wallet"), [quote, setQuote] = useState<{ fingerprint: string; pricing: Pricing } | null>(null);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [, startTransition] = useTransition(), [pending, setPending] = useState<Operation | null>(null);
  const [errorReference, setErrorReference] = useState<{ code: string; requestId?: string } | null>(null);
  const [clock, setClock] = useState({ remaining: initial.data?.seconds_remaining ?? 0, received: 0 });
  const [seconds, setSeconds] = useState(initial.data?.seconds_remaining ?? 0);
  const [checkout, setCheckout] = useState<InstantCheckout | null>(initial.data?.checkout ?? null), [sessionId, setSessionId] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [paymentReview, setPaymentReview] = useState(false);
  const initialized = useRef<string | null>(null), operation = useRef(false), polling = useRef(false);
  const request = response.data, uuid = request?.request_uuid, storage = "zuwara-instant-operation:" + identity;
  const input: InstantInput = { duration_id: Number(duration), consultation_type: "online", communication_type: communication, problem, payment_method: method, ...(patient ? { patient_id: Number(patient) } : {}),
    ...(type === "private" ? { doctor_id: Number(doctor) } : category ? { category_id: Number(category) } : {}) };
  const fingerprint = JSON.stringify({ type, input });
  const apply = useCallback((value: V2Envelope<InstantRequest | null>) => {
    setResponse(value); setCheckout(value.data?.checkout ?? null);
    const row = value.data;
    const unresolvedPayment = sessionStorage.getItem(storage + ":payment-review");
    if (row && unresolvedPayment === row.checkout?.checkout_id && (row.checkout?.paid || ["failed", "expired"].includes(row.checkout?.status ?? ""))) sessionStorage.removeItem(storage + ":payment-review");
    setPaymentReview(Boolean(row?.checkout && sessionStorage.getItem(storage + ":payment-review") === row.checkout.checkout_id));
    if (row) sessionStorage.setItem(storage + ":request", JSON.stringify({ uuid: row.request_uuid, checkoutId: row.checkout?.checkout_id ?? null }));
    else sessionStorage.removeItem(storage + ":request");
    const remaining = row?.timer_expires_at ? Math.max(0, Math.min(row.seconds_remaining, (Date.parse(row.timer_expires_at) - Date.parse(row.server_time)) / 1000)) : 0;
    setClock({ remaining, received: performance.now() });
  }, [storage]);
  const fail = useCallback((result: { code: string; requestId?: string }, requestType?: InstantType) => { setError(instantErrorMessage(result.code, locale, requestType)); setErrorReference(result); }, [locale]);
  const refresh = useCallback(async () => {
    const result = await statusAction(uuid);
    if (result.ok) apply(result.value);
    else { setError(instantErrorMessage(result.code, locale)); setErrorReference(result); }
  }, [uuid, apply, locale]);
  useEffect(() => {
    let disposed = false;
    const timer = setTimeout(async () => {
      const saved = sessionStorage.getItem(storage);
      setPaymentReview(Boolean(initial.data?.checkout && sessionStorage.getItem(storage + ":payment-review") === initial.data.checkout.checkout_id));
      if (saved) { try { setPending(JSON.parse(saved)); } catch { setError("Unable to recover the previous operation. Contact support."); } }
      setClock({ remaining: initial.data?.seconds_remaining ?? 0, received: performance.now() });
      if (initial.data) sessionStorage.setItem(storage + ":request", JSON.stringify({ uuid: initial.data.request_uuid, checkoutId: initial.data.checkout?.checkout_id ?? null }));
      else {
        const reference = sessionStorage.getItem(storage + ":request");
        if (reference) {
          try {
            const result = await statusAction(JSON.parse(reference).uuid);
            if (disposed) return;
            if (result.ok) { apply(result.value); if (result.value.data) window.history.replaceState(null, "", "?request=" + result.value.data.request_uuid); }
            else if (result.status === 404) sessionStorage.removeItem(storage + ":request");
            else fail(result);
          } catch { if (!disposed) setError("Unable to recover the request. Refresh status or contact support."); }
        }
      }
    }, 0);
    return () => { disposed = true; clearTimeout(timer); };
  }, [storage, initial, apply, fail]);
  useEffect(() => {
    const poll = () => {
      if (document.hidden || operation.current || polling.current) return;
      polling.current = true;
      startTransition(async () => { try { await refresh(); } catch { /* Keep the current screen and retry on the next check. */ } finally { polling.current = false; } });
    };
    const timer = uuid && !terminal.has(request?.request_status ?? "") ? setInterval(poll, 5000) : undefined;
    document.addEventListener("visibilitychange", poll); window.addEventListener("online", poll); window.addEventListener("focus", poll);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", poll); window.removeEventListener("online", poll); window.removeEventListener("focus", poll); };
  }, [refresh, uuid, request?.request_status]);
  useEffect(() => {
    const tick = () => setSeconds(Math.max(0, Math.ceil(clock.remaining - (performance.now() - clock.received) / 1000)));
    const timer = setInterval(tick, 1000); return () => clearInterval(timer);
  }, [clock]);
  useEffect(() => { if (request?.timer_type && seconds === 0) startTransition(async () => { await refresh(); }); }, [seconds, request?.timer_type, refresh]);
  function run(work: () => Promise<void>) {
    if (operation.current) return;
    operation.current = true; setBusy(true); setError(""); setErrorReference(null);
    startTransition(async () => { try { await work(); } catch { setError(t("The outcome is unknown. Refresh the request before trying again.", "النتيجة غير مؤكدة. حدّث حالة الطلب قبل المحاولة مجدداً.")); } finally { operation.current = false; setBusy(false); } });
  }
  async function command(name: Operation["name"], retry?: Operation) {
    if (pending && !retry) return;
    const op = retry ?? { name, type, input, uuid, key: "instant-" + crypto.randomUUID() };
    sessionStorage.setItem(storage, JSON.stringify(op)); setPending(op);
    const result = op.name === "create" ? await createAction(op.type, op.input, op.key) : op.name === "pay" ? await payAction(op.uuid!, op.input, op.key) : await cancelAction(op.uuid!, op.key);
    if (!result.ok) {
      fail(result, op.type); await refresh();
      // Only definitive rejections permit a new operation. Unknown financial outcomes retain the original key.
      if ([400, 403, 404, 422].includes(result.status ?? 0) || ["INSTANT_UNAVAILABLE", "NO_INSTANT_CONSULTANTS", "INSUFFICIENT_WALLET", "INSTANT_ATTEMPT_LIMIT", "INSTANT_V2_DISABLED", "COUPON_UNAVAILABLE", "CONTRACT_BOOKING_REQUIRED"].includes(result.code)) { sessionStorage.removeItem(storage); setPending(null); }
      return;
    }
    apply(result.value); sessionStorage.removeItem(storage); setPending(null);
    const rows = await historyAction(1); if (rows.ok) setHistory(rows.value);
    window.history.replaceState(null, "", "?request=" + result.value.data.request_uuid);
  }
  async function checkoutCommand(command?: "session" | "confirm", paymentId?: string) {
    if (!request?.checkout) return;
    if (command === "confirm") { sessionStorage.setItem(storage + ":payment-review", request.checkout.checkout_id); setPaymentReview(true); }
    const result = await checkoutAction(request.request_uuid, request.checkout.checkout_id, command, paymentId);
    if (!result.ok) { fail(result); await refresh(); return; }
    setCheckout(result.value.data);
    if (command === "session") setSessionId(result.value.data.session_id);
    await refresh();
  }
  useEffect(() => {
    if (!sessionId || !sdkReady || !window.myfatoorah || initialized.current === sessionId) return;
    initialized.current = sessionId;
    window.myfatoorah.init({ sessionId, containerId: "instant-payment", shouldHandlePaymentUrl: true, callback: result => {
      if (result.paymentId) run(() => checkoutCommand("confirm", result.paymentId));
      else setError(t("Refresh payment status to verify the gateway result.", "حدّث حالة الدفع للتحقق من نتيجة بوابة الدفع."));
    } });
  });
  const currentCheckout = checkout ?? request?.checkout;
  const canResume = currentCheckout && !paymentReview && !currentCheckout.paid && currentCheckout.status === "pending";
  const states: Record<string, string> = ar ? { pending_payment: "بانتظار الدفع", pending: "بانتظار رد الاستشاري", accepted_awaiting_payment: "وافق الاستشاري — أكمل الدفع", accepted: "تم تأكيد الموعد", declined_all: "لم يقبل الاستشاريون الطلب", expired: "انتهت المهلة", cancelled: "تم إلغاء الطلب" } : { pending_payment: "Awaiting payment", pending: "Waiting for a consultant", accepted_awaiting_payment: "Consultant accepted — payment required", accepted: "Appointment confirmed", declined_all: "No consultant accepted", expired: "Request expired", cancelled: "Request cancelled" };
  return <div className={s.page} dir={ar ? "rtl" : "ltr"}>
    <header className={s.hero}>
      <div className={s.heroCopy}><span className={s.eyebrow}><Zap size={15} />{t("CARE WHEN YOU NEED IT", "الرعاية وقت حاجتك")}</span><h1>{t("Your next step to feeling better.", "خطوتك القادمة نحو صحة أفضل.")}</h1><p>{t("Connect with an available consultant, or send a request to someone you trust.", "تواصل مع استشاري متاح، أو أرسل طلباً إلى استشاري تثق به.")}</p><span className={s.heroBadge}><ShieldCheck size={15} />{t("Secure online consultations", "استشارات آمنة عبر الإنترنت")}</span></div>
      <span className={s.heroSymbol} aria-hidden="true"><Zap size={54} strokeWidth={1.4} /></span>
    </header>
    <div className={s.pageHead}><div><h2>{t("Instant consultations", "الاستشارات الفورية")}</h2><p>{t("Choose your care. Review your price. We’ll guide you from there.", "اختر استشارتك وراجع السعر، وسنرشدك للخطوة التالية.")}</p></div><button className={s.refresh} disabled={busy} onClick={() => run(refresh)}><RefreshCw size={15} className={busy ? s.spinning : undefined} />{t("Refresh status", "تحديث الحالة")}</button></div>
    {error && <div className={s.error} role="alert"><p>{error}</p>{errorReference && <details className={s.errorDetails}><summary>{t("Details for support", "تفاصيل للدعم")}</summary><p dir="ltr">{errorReference.code}{errorReference.requestId ? " · " + errorReference.requestId : ""}</p></details>}</div>}
    {pending && <section className={s.card}><p>{t("An earlier operation needs recovery. Check its status or retry the same operation. Contact support if review is required.", "تحتاج عملية سابقة إلى استعادة. تحقق من حالتها أو أعد العملية نفسها. تواصل مع الدعم إذا لزمت المراجعة.")}</p><div className={s.actions}><button disabled={busy} onClick={() => run(() => command(pending.name, pending))}>{t("Recover same operation", "استعادة العملية نفسها")}</button></div></section>}
    {request && <section className={s.card}>
      <div className={s.sectionHead}><span className={s.sectionIcon}>{request.request_status === "accepted" ? <CalendarCheck2 size={23} /> : <Clock3 size={23} />}</span><div><span className={s.overline}>{t("YOUR REQUEST", "طلبك")}</span><h2>{states[request.request_status] ?? request.request_status}</h2></div><span className={s.statusBadge} data-status={request.request_status}>{request.type === "private" ? t("Private", "خاص") : t("Public", "عام")}</span></div>
      <dl className={s.facts}><dt>{t("Request", "الطلب")}</dt><dd>{request.request_uuid}</dd><dt>{t("Duration", "المدة")}</dt><dd>{request.duration_minutes} {t("minutes", "دقيقة")}</dd><dt>{t("Payment verified", "تم التحقق من الدفع")}</dt><dd>{request.paid ? t("Yes", "نعم") : t("No", "لا")}</dd><dt>{t("Refund status", "حالة الاسترداد")}</dt><dd>{request.refund_status}</dd><dt>{t("Attempts", "المحاولات")}</dt><dd>{request.attempts_used} / {request.max_attempts}</dd></dl>
      {request.timer_type && <div className={s.countdown}><Clock3 size={23} /><div><span>{request.timer_type === "payment" ? t("Time to pay", "مهلة الدفع") : t("Consultant response", "رد الاستشاري")}</span><p>{t("Your status updates automatically.", "يتم تحديث حالة طلبك تلقائياً.")}</p></div><strong role="timer" dir="ltr">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</strong></div>}
      {request.refund_status === "manual_review_required" && <p role="alert">{t("Contact support for payment/refund review. A gateway refund is not automatic.", "تواصل مع الدعم لمراجعة الدفع أو الاسترداد. استرداد بوابة الدفع ليس تلقائياً.")}</p>}
      {request.pricing_summary && <Price pricing={request.pricing_summary} ar={ar} />}
      <div className={s.actions}>
        {request.request_status === "accepted" && request.appointment_id && <Link href={"/dashboard/appointments/" + request.appointment_id}>{t("Open appointment", "فتح الموعد")}</Link>}
        {request.can_cancel && <button disabled={busy || Boolean(pending)} onClick={() => run(() => command("cancel"))}>{t("Cancel request", "إلغاء الطلب")}</button>}
      </div>
      {request.can_pay && !request.checkout && <div className={s.actions}><PaymentSelect method={method} change={setMethod} ar={ar} cardEnabled={cardEnabled} /><button disabled={busy || Boolean(pending)} onClick={() => run(() => command("pay"))}>{t("Pay for accepted request", "دفع الطلب المقبول")}</button></div>}
      {currentCheckout && <section><h3>{t("Payment", "الدفع")}: {currentCheckout.status}</h3><p>{currentCheckout.amount} {currentCheckout.currency}</p><div className={s.actions}>
        {canResume && currentCheckout.gateway === "tamara" && <button disabled={busy} onClick={() => run(async () => { const result = await checkoutAction(request.request_uuid, currentCheckout.checkout_id); if (!result.ok) { fail(result); return; } setCheckout(result.value.data); if (result.value.data.status === "pending" && !result.value.data.paid && result.value.data.checkout_url) window.location.assign(result.value.data.checkout_url); })}>{t("Continue Tamara payment", "متابعة الدفع عبر تمارا")}</button>}
        {canResume && currentCheckout.gateway === "myfatoorah" && cardEnabled && <button disabled={busy || Boolean(sessionId)} onClick={() => run(() => checkoutCommand("session"))}>{t("Open secure payment", "فتح الدفع الآمن")}</button>}
        <button disabled={busy} onClick={() => run(() => checkoutCommand())}>{t("Refresh payment", "تحديث الدفع")}</button>
        {currentCheckout.gateway === "tamara" && !currentCheckout.paid && <button disabled={busy} onClick={() => run(() => checkoutCommand("confirm"))}>{t("Verify payment", "التحقق من الدفع")}</button>}
      </div>{paymentReview && <p role="status">{t("Payment verification is pending. Refresh status or contact support before paying again.", "التحقق من الدفع قيد الانتظار. حدّث الحالة أو تواصل مع الدعم قبل الدفع مجدداً.")}</p>}<div id="instant-payment" hidden={paymentReview || currentCheckout.paid} />{sessionId && <Script src="https://sa.myfatoorah.com/sessions/v1/session.js" onReady={() => setSdkReady(true)} onError={() => setError(t("Unable to load the payment form.", "تعذر تحميل نموذج الدفع."))} />}
      <details><summary>{t("Payment details", "تفاصيل الدفع")}</summary><pre className={s.response} dir="ltr">{JSON.stringify(currentCheckout, null, 2)}</pre></details></section>}
      <details><summary>{t("Full request response", "استجابة الطلب الكاملة")}</summary><pre className={s.response} dir="ltr">{JSON.stringify(response, null, 2)}</pre></details>
    </section>}
    {!request && settings.enabled && <section className={s.card}><div className={s.sectionHead}><span className={s.sectionIcon}><Zap size={23} /></span><div><h2>{t("New instant request", "طلب فوري جديد")}</h2><p>{t("A few details to find the right care for you.", "تفاصيل بسيطة تساعدنا في تقديم الرعاية المناسبة لك.")}</p></div><span className={s.stepBadge}>{t("Online care", "رعاية عن بُعد")}</span></div>
      <ol className={s.steps} aria-label={t("Booking steps", "خطوات الحجز")}><li className={s.currentStep}><b>1</b>{t("Consultation details", "تفاصيل الاستشارة")}</li><li className={quote?.fingerprint === fingerprint ? s.currentStep : undefined}><b>2</b>{t("Review price", "مراجعة السعر")}</li><li><b>3</b>{t("Send your request", "إرسال الطلب")}</li></ol>
      <form onChange={() => { setError(""); setErrorReference(null); }} onSubmit={event => { event.preventDefault(); run(async () => { const result = await previewAction(type, input); if (result.ok) setQuote({ fingerprint, pricing: result.value.data.pricing_summary }); else { setQuote(null); fail(result, type); } }); }}>
      <fieldset disabled={busy || Boolean(pending)} className={s.form} style={{ border: 0, padding: 0 }}>
        <fieldset className={`${s.typeChoice} ${s.wide}`}><legend>{t("Choose your instant consultation type", "اختر نوع الاستشارة الفورية")}</legend><div className={s.typeGrid}>{(["public", "private"] as const).map(option => <label key={option} className={`${s.typeOption} ${type === option ? s.typeSelected : ""}`}><input type="radio" name="instant-type" value={option} checked={type === option} onChange={() => setType(option)} /><span className={s.typeIcon}>{option === "public" ? <Users size={22} /> : <UserRound size={22} />}</span><span><strong>{option === "public" ? t("Public instant consultation", "استشارة فورية عامة") : t("Private instant consultation", "استشارة فورية خاصة")}</strong><small>{option === "public" ? t("We match you with an eligible consultant. Payment is required before matching.", "نبحث لك عن استشاري مؤهل. يتم الدفع قبل البحث عن استشاري.") : t("You select one consultant. Send a request and pay only after they accept.", "اختر استشارياً محدداً. أرسل الطلب وادفع فقط بعد موافقته.")}</small></span><span className={s.radioMark} aria-hidden="true" /></label>)}</div></fieldset>
        <label>{t("Patient", "المريض")}<select value={patient} onChange={event => setPatient(event.target.value)}><option value="">{t("Myself", "نفسي")}</option>{dependents.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>
        {type === "private" && <label>{t("Consultant", "الاستشاري")}<select required value={doctor} onChange={event => setDoctor(event.target.value)}><option value="">{t("Select consultant", "اختر الاستشاري")}</option>{consultants.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</select></label>}
        <label>{t("Duration", "المدة")}<select required value={duration} onChange={event => setDuration(event.target.value)}>{settings.durations.map(row => <option key={row.id} value={row.id}>{row.minutes} {t("minutes", "دقيقة")} · {(row.service_price_halalas / 100).toFixed(2)} {row.currency}</option>)}</select></label>
        <label>{t("Communication", "التواصل")}<select value={communication} onChange={event => setCommunication(event.target.value as typeof communication)}><option value="video">{t("Video", "مرئي")}</option><option value="audio">{t("Audio", "صوتي")}</option><option value="chat">{t("Chat", "محادثة")}</option></select></label>
        {type === "public" && <><label>{t("Specialty", "التخصص")}<select value={category} onChange={event => setCategory(event.target.value)}><option value="">{t("Any specialty", "جميع التخصصصات")}</option>{categories.map(row => <option key={row.id} value={row.id}>{ar ? row.titleAr ?? row.title : row.title}</option>)}</select></label><PaymentSelect method={method} change={setMethod} ar={ar} cardEnabled={cardEnabled} /></>}
        <label className={s.wide}>{t("What can we help you with?", "كيف يمكننا مساعدتك؟")}<textarea required rows={4} maxLength={555} placeholder={t("Briefly describe your symptoms or what you’d like to discuss…", "صف باختصار أعراضك أو ما تود مناقشته…")} value={problem} onChange={event => setProblem(event.target.value)} /><span className={s.fieldHint}><span>{t("Shared with your consultant to help prepare for your visit.", "تُشارك مع استشاريك للتحضير للاستشارة.")}</span><span dir="ltr">{problem.length}/555</span></span></label>
        <div className={`${s.formFooter} ${s.wide}`}><span><ShieldCheck size={17} />{t("Your information stays private and secure.", "معلوماتك خاصة وآمنة.")}</span><div className={s.actions}><button type="submit" disabled={!duration}>{busy ? t("Please wait…", "يرجى الانتظار…") : t("Review price", "مراجعة السعر")}<ArrowUpRight size={17} /></button></div></div>
      </fieldset>
    </form>{quote?.fingerprint === fingerprint && <><Price pricing={quote.pricing} ar={ar} /><p>{type === "private" ? t("Estimate only. No charge until the consultant accepts and you choose to pay.", "سعر تقديري. لا يتم الدفع إلا بعد موافقة الاستشاري واختيارك الدفع.") : t("Payment is collected before matching with available consultants.", "يتم تحصيل الدفع قبل البحث عن استشاري متاح.")}</p><div className={s.actions}><button disabled={busy || Boolean(pending) || !problem.trim()} onClick={() => run(() => command("create"))}>{type === "private" ? t("Send private request", "إرسال طلب خاص") : t("Pay and request a consultant", "الدفع وطلب استشاري")}</button></div></>}
    </section>}
    {request && terminal.has(request.request_status) && <div className={s.actions}><button disabled={busy || Boolean(pending)} onClick={() => run(async () => { const active = await statusAction(); if (!active.ok) { fail(active); return; } if (active.value.data && !terminal.has(active.value.data.request_status)) { apply(active.value); return; } apply({ ...active.value, data: null }); setQuote(null); setSessionId(null); window.history.replaceState(null, "", window.location.pathname); })}>{t("Back to new request", "العودة إلى طلب جديد")}</button></div>}
    <section className={s.card}><div className={s.sectionHead}><span className={s.sectionIcon}><History size={22} /></span><div><h2>{t("Request history", "سجل الطلبات")}</h2><p>{t("Your recent requests, all in one place.", "طلباتك الأخيرة، في مكان واحد.")}</p></div></div>{history.data.length === 0 && <div className={s.empty}><History size={28} /><div><strong>{t("Your care journey starts here", "رحلتك نحو الرعاية تبدأ هنا")}</strong><p>{t("Once you send a request, you can track it here.", "بعد إرسال طلبك، يمكنك متابعته هنا.")}</p></div></div>}<div className={s.history}>{history.data.map(row => <button key={row.request_uuid} disabled={busy} onClick={() => run(async () => { const result = await statusAction(row.request_uuid); if (result.ok) { apply(result.value); setSessionId(null); window.history.replaceState(null, "", "?request=" + row.request_uuid); } else fail(result); })}><span className={s.sectionIcon}>{row.type === "private" ? <UserRound size={20} /> : <Users size={20} />}</span><span className={s.historyText}><strong>{row.type === "private" ? t("Private consultation", "استشارة خاصة") : t("Public consultation", "استشارة عامة")}</strong><small>{row.duration_minutes} {t("minutes", "دقيقة")} · {new Intl.DateTimeFormat(ar ? "ar-SA" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Riyadh" }).format(new Date(row.created_at))}</small></span><span className={s.statusBadge} data-status={row.request_status}>{states[row.request_status]}</span><ArrowUpRight size={17} /></button>)}</div><div className={s.actions}>{[-1, 1].map(step => {
      const page = history.meta?.pagination?.current_page ?? 1;
      return (step < 0 ? page > 1 : history.meta?.pagination?.has_more) && <button key={step} disabled={busy} onClick={() => run(async () => { const result = await historyAction(page + step); if (result.ok) setHistory(result.value); else fail(result); })}>{step < 0 ? t("Previous", "السابق") : t("Next", "التالي")}</button>;
    })}</div></section>
  </div>;
}
function PaymentSelect({ method, change, ar, cardEnabled }: { method: PaymentMethod; change: (value: PaymentMethod) => void; ar: boolean; cardEnabled: boolean }) {
  return <label>{ar ? "طريقة الدفع" : "Payment method"}<select value={method} onChange={event => change(event.target.value as PaymentMethod)}><option value="wallet">{ar ? "المحفظة" : "Wallet"}</option><option value="tamara">{ar ? "تمارا" : "Tamara"}</option>{cardEnabled && <option value="myfatoorah">{ar ? "بطاقة" : "Card"}</option>}</select></label>;
}
function Price({ pricing, ar }: { pricing: Pricing; ar: boolean }) {
  return <dl className={s.price}>{([[ar ? "الخدمة" : "Service", pricing.service_amount], [ar ? "الخصم" : "Discount", pricing.discount_amount], [ar ? "المجموع الفرعي" : "Subtotal", pricing.subtotal], [ar ? "الضريبة" : "Tax", pricing.total_tax_amount], [ar ? "الإجمالي" : "Total", pricing.payable_amount]]).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value} {pricing.currency}</dd></div>)}</dl>;
}
