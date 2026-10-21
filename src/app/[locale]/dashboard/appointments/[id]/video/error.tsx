"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
import s from "./video.module.css";
export default function VideoError({reset}:{reset:()=>void}){
  const ar=useLocale()==="ar";
  return <section className={s.call} role="alert"><h2>{ar?"المكالمة غير متاحة":"Video is unavailable"}</h2>
    <p>{ar?"تحقق من الاتصال وحاول مجدداً.":"Check your connection and try again."}</p>
    <button onClick={reset}>{ar?"حاول مجدداً":"Try again"}</button>
    <Link href={(ar?"/ar":"")+"/dashboard/appointments"}>{ar?"العودة إلى المواعيد":"Back to appointments"}</Link></section>;
}
