"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { copy } from "../copy";
import s from "../messages.module.css";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const t = (isAr ? copy.ar : copy.en).notFound;

  return (
    <div className={s.placeholder} style={{ display: "grid" }}>
      <span className={s.phIcon}><SearchX size={28} /></span>
      <h3>{t.title}</h3>
      <p>{t.text}</p>
      <Link href={`${isAr ? "/ar" : ""}/dashboard/messages`} className={s.cta}>{t.back}</Link>
    </div>
  );
}