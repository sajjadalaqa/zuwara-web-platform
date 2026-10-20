"use client";
import { useEffect } from "react";

// The shared root persists during client navigation, including locale switches.
export default function LocaleDocument({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}