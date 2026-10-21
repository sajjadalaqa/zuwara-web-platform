"use client";
import { useLocale } from "next-intl";
export default function ReportsError({ reset }: { reset: () => void }) {
  const ar = useLocale() === "ar";
  return <section role="alert"><h2>{ar ? "تعذر تحميل التقارير" : "Reports are unavailable"}</h2>
    <p>{ar ? "قد يكون مصدر التقارير غير متاح أو غير مرتبط بحسابك. حاول مجدداً أو اختر المصدر الآخر." : "This report source may be unavailable or not linked to your account. Retry or select the other source."}</p>
    <button onClick={reset}>{ar ? "حاول مجدداً" : "Try again"}</button>
    <a href={ar ? "/ar/dashboard/records" : "/dashboard/records"}>{ar ? "تقارير الاستشارات" : "Consultation reports"}</a>
    <a href={ar ? "/ar/dashboard/records?source=d4h" : "/dashboard/records?source=d4h"}>{ar ? "نتائج الزيارات المنزلية" : "Home-service results"}</a>
  </section>;
}
