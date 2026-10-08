"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SearchX } from "lucide-react";
import { detailCopy } from "./detailCopy";
import s from "./detail.module.css";

export default function NotFound() {
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const t = (isAr ? detailCopy.ar : detailCopy.en).notFound;

  return (
    <div className={s.page}>
      <div className={s.empty}>
        <span className={s.emptyIcon}><SearchX size={26} /></span>
        <h3>{t.title}</h3>
        <p>{t.text}</p>
        <Link href={`${isAr ? "/ar" : ""}/dashboard/requests`} className={s.actPrimary}>
          {t.back}
        </Link>
      </div>
    </div>
  );
}