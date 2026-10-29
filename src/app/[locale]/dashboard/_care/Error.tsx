"use client";
import { useUiText } from "@/i18n/use-ui-text";
import Link from "next/link";
import { useLocale } from "next-intl";
import s from "./care.module.css";
export default function CareError({ reset }: { reset: () => void }) {
  const uiText = useUiText();
  const ar = useLocale() === "ar";
  return (
    <section className={s.card} role="alert">
      <h2>
        {ar
          ? "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a"
          : "This service could not be loaded"}
      </h2>
      <p>
        {uiText("The backend may be unavailable or this record may not be accessible to your account. Retry or choose another service.")}{" "}</p>
      <div className={s.actions}>
        <button className={s.button} onClick={reset}>
          {uiText("Try again")}{" "}</button>
        <Link href={(ar ? "/ar" : "") + "/dashboard"}>{uiText("Back to dashboard")}</Link>
      </div>
    </section>
  );
}
