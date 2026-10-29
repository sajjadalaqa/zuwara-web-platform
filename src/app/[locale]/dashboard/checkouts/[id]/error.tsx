"use client";
import { useUiText } from "@/i18n/use-ui-text";

import {useLocale} from "next-intl";
import s from "@/app/[locale]/dashboard/wallet/wallet.module.css";
export default function PaymentError({reset}:{reset:()=>void}){
  const uiText = useUiText();
  const ar=useLocale()==="ar";
  return <section className={s.card} role="alert"><h2>{ar?"تعذر تحميل الدفع":"Payment is unavailable"}</h2>
    <p>{ar?"أعد محاولة الدفع نفسه أو تواصل مع الدعم قبل بدء دفعة جديدة.":"Retry this same checkout or contact support before starting another payment."}</p>
    <button className={s.addBtn} onClick={reset}>{ar?"حاول مجدداً":uiText("Try again")}</button></section>;
}
