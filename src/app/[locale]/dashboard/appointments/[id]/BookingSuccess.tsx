"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import s from "./booking-success.module.css";

export default function BookingSuccess({ id }: { id: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const ar = useLocale() === "ar";

  useEffect(() => {
    const key = "zuwara-created-appointment:" + id;
    try {
      if (sessionStorage.getItem(key) !== "1") return;
      dialog.current?.showModal();
      sessionStorage.removeItem(key);
    } catch { /* Storage restrictions must not interrupt the appointment page. */ }
  }, [id]);

  return (
    <dialog ref={dialog} className={s.dialog} aria-labelledby="booking-success-title" aria-describedby="booking-success-description" dir={ar ? "rtl" : "ltr"}>
      <div className={s.content}>
        <svg className={s.tick} viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <circle className={s.circle} cx="40" cy="40" r="35" />
          <path className={s.check} d="m23 40 11 11 23-24" />
        </svg>
        <h2 id="booking-success-title">{ar ? "تم إنشاء موعدك بنجاح!" : "Your appointment has been created!"}</h2>
        <p id="booking-success-description">{ar ? "يمكنك الآن عرض تفاصيل موعدك." : "You can now view all your appointment details."}</p>
        <form method="dialog"><button autoFocus className={s.button}>{ar ? "عرض تفاصيل الموعد" : "View appointment details"}</button></form>
      </div>
    </dialog>
  );
}
