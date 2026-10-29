"use client";
import { useUiText } from "@/i18n/use-ui-text";

import { useRef, useState } from "react";
import Script from "next/script";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { Checkout } from "@/lib/api/zuwara/checkouts";
import { paymentSessionAction, verifyPaymentAction, paymentStatusAction } from "./actions";
import s from "@/app/[locale]/dashboard/wallet/wallet.module.css";
declare global { interface Window { myfatoorah?: { init: (config: { sessionId: string; containerId: string; shouldHandlePaymentUrl: boolean; callback: (response: { paymentId?: string; redirectionUrl?: string }) => void }) => void } } }
export default function Payment({ initial, scriptUrl, hostedUrl }: { initial: Checkout; scriptUrl: string; hostedUrl: string | null }) {
  const uiText = useUiText();
  const ar = useLocale() === "ar", router = useRouter();
  const [checkout, setCheckout] = useState(initial), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null), [sdkReady, setSdkReady] = useState(false);
  const paymentId = useRef<string | undefined>(undefined), initialized = useRef<string | null>(null);
  async function verify(reference?: string) {
    if (reference) paymentId.current = reference;
    setBusy(true); setError("");
    try {
      const result = await verifyPaymentAction(initial.checkout_id, paymentId.current);
      if (!result.ok) throw new Error(); setCheckout(result.checkout);
      if (!result.checkout.paid) setError(ar ? "لم يتم تأكيد الدفع بعد. لا تبدأ دفعة جديدة." : "Payment is not confirmed yet. Do not start another payment.");
      router.refresh();
    } catch { setError(ar ? "تعذر التحقق. تحقق من الحالة أو تواصل مع الدعم قبل الدفع مجدداً." : "Verification is unavailable. Check this payment's status or contact support before paying again."); }
    finally { setBusy(false); }
  }
  function initialize(id: string) {
    if (!window.myfatoorah || initialized.current === id) return;
    initialized.current = id;
    window.myfatoorah.init({ sessionId: id, containerId: "zuwara-payment", shouldHandlePaymentUrl: true,
      callback: response => {
        let reference = response.paymentId;
        if (!reference && response.redirectionUrl) {
          try { const url = new URL(response.redirectionUrl);
            if (url.protocol === "https:" && ["sa.myfatoorah.com", "demo.myfatoorah.com", "portal.myfatoorah.com"].includes(url.hostname)) reference = url.searchParams.get("paymentId") ?? undefined;
          } catch { /* Ignore an invalid gateway reference. */ }
        }
        if (reference) void verify(reference);
        else setError(ar ? "اكتملت الخطوة لدى بوابة الدفع. تحقق من حالة الدفع." : "The gateway step completed. Check the payment status.");
      } });
  }
  async function begin() {
    setBusy(true); setError("");
    try { const result = await paymentSessionAction(initial.checkout_id); if (!result.ok) throw new Error(); setSessionId(result.session.sessionId);
      if (sdkReady) initialize(result.session.sessionId);
    } catch { setError(ar ? "تعذر بدء جلسة الدفع. أعد محاولة الجلسة نفسها." : "Unable to start the payment session. Retry this same checkout."); }
    finally { setBusy(false); }
  }
  const review = checkout.status === "review_required";
  return <section className={s.card}>
    <div className={s.cardHead}><h2>{ar ? "الدفع" : uiText("Payment")}</h2><strong>{checkout.amount} {checkout.currency}</strong></div>
    {checkout.paid ? <p role="status">{ar ? "تم تأكيد الدفع" : "Payment confirmed"}</p> : review ? <p role="alert">{ar ? "الدفع قيد المراجعة. تواصل مع الدعم ولا تدفع مجدداً." : "This payment needs review. Contact support; do not pay again."}</p> : <>
      {hostedUrl ? <a className={s.addBtn} href={hostedUrl}>{ar ? "متابعة الدفع" : "Continue payment"}</a> : <button className={s.addBtn} disabled={busy || Boolean(sessionId)} onClick={begin}>{ar ? "فتح الدفع الآمن" : "Open secure payment"}</button>}
      {sessionId && <Script src={scriptUrl} strategy="afterInteractive" onReady={()=>{setSdkReady(true);initialize(sessionId);}} onError={()=>setError(ar ? "تعذر تحميل بوابة الدفع." : "The payment form could not load.")} />}
      <div id="zuwara-payment" />
      <button className={s.addBtn} disabled={busy} onClick={()=>void verify()}>{ar ? "التحقق من الدفع" : "Verify payment"}</button>
    </>}
    <button className={s.addBtn} disabled={busy} onClick={async()=>{setBusy(true);try{setCheckout(await paymentStatusAction(initial.checkout_id));}catch{setError(ar ? "تعذر تحميل الحالة." : "Unable to load status.");}finally{setBusy(false);}}}>{ar ? "تحديث الحالة" : "Refresh status"}</button>
    {error && <p role="alert">{uiText(error)}</p>}
  </section>;
}
