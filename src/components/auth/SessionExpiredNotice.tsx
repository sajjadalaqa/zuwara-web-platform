"use client";

import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import s from "./auth.module.css";

export default function SessionExpiredNotice() {
  const params = useSearchParams();
  const ar = useLocale() === "ar";
  if (params.get("reason") !== "session-expired") return null;
  return <p className={s.otpNotice} role="status">{ar
    ? "انتهت صلاحية جلستك. يرجى تسجيل الدخول مجدداً لتجديد جلستك."
    : "Your session has expired. Please sign in again to renew your session."}</p>;
}
