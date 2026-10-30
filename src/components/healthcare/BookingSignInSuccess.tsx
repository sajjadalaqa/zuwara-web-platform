"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import s from "./booking-sign-in-success.module.css";

export default function BookingSignInSuccess({ bookingHref }: { bookingHref: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const ar = useLocale() === "ar";
  useEffect(() => {
    dialog.current?.showModal();
    const url = new URL(window.location.href);
    url.searchParams.delete("bookingSignIn");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);
  return <dialog ref={dialog} className={s.dialog} aria-labelledby="booking-sign-in-title" dir={ar ? "rtl" : "ltr"}>
    <span className={s.check} aria-hidden="true">✓</span>
    <h2 id="booking-sign-in-title">{ar ? "تم تسجيل الدخول بنجاح" : "Signed in successfully"}</h2>
    <p>{ar ? "يمكنك الآن متابعة حجز موعدك أو الانتقال إلى لوحة التحكم." : "You can now continue booking your appointment or go to your dashboard."}</p>
    <div className={s.actions}>
      <Link href={bookingHref} className="button button-primary">{ar ? "متابعة الحجز" : "Continue booking"}</Link>
      <Link href="/dashboard" className="button">{ar ? "الذهاب إلى لوحة التحكم" : "Go to your dashboard"}</Link>
      <button type="button" onClick={() => dialog.current?.close()}>{ar ? "البقاء في صفحة الاستشاري" : "Stay on consultant page"}</button>
    </div>
  </dialog>;
}
