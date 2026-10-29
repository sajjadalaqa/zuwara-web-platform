"use client";
import { useUiText } from "@/i18n/use-ui-text";

import { useLocale } from "next-intl";
import Link from "next/link";
import s from "./chat.module.css";
export default function ChatError({ reset }: { reset: () => void }) {
  const uiText = useUiText();
  const ar=useLocale()==="ar";
  return <section className={s.chat} role="alert"><h2>{ar?"تعذر تحميل المحادثة":"Conversation unavailable"}</h2>
    <p>{ar?"تحقق من الاتصال وأهلية الموعد، ثم حاول مجدداً.":"Check your connection and appointment eligibility, then retry."}</p>
    <button onClick={reset}>{ar?"حاول مجدداً":uiText("Try again")}</button>
    <Link href={(ar?"/ar":"")+"/dashboard/appointments"}>{ar?"العودة إلى المواعيد":"Back to appointments"}</Link></section>;
}
