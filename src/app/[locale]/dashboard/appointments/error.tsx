"use client";

import { useParams } from "next/navigation";
import { AlertTriangle, RotateCw } from "lucide-react";
import { copy } from "./copy";
import s from "./appointments.module.css";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const params = useParams<{ locale?: string }>();
  const t = (params?.locale === "ar" ? copy.ar : copy.en).error;

  return (
    <div className={s.page}>
      <div className={s.empty}>
        <span className={s.emptyIcon}><AlertTriangle size={26} /></span>
        <h3>{t.title}</h3>
        <p>{t.text}</p>
        <button type="button" className={s.bookBtn} onClick={reset}>
          <RotateCw size={16} />
          {t.retry}
        </button>
      </div>
    </div>
  );
}