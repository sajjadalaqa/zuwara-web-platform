"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { copy } from "../copy";
import s from "../complaints.module.css";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const t = (isAr ? copy.ar : copy.en).detail.notFound;

  return (
    <div className={s.page}>
      <div className={s.empty}>
        <span className={s.emptyIcon}><SearchX size={26} /></span>
        <h3>{t.title}</h3>
        <p>{t.text}</p>
        <Link href={`${isAr ? "/ar" : ""}/dashboard/complaints`} className={s.actPrimary}>
          {t.back}
        </Link>
      </div>
    </div>
  );
}