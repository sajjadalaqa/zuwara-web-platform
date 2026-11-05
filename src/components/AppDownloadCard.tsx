"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Smartphone, QrCode, X } from "lucide-react";
import { FaApple, FaGooglePlay } from "react-icons/fa";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/data/site";
import s from "./AppDownloadCard.module.css";

export default function AppDownloadCard({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const [minimized, setMinimized] = useState(false);
  const [qr, setQr] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const target = new URL("/api/app-download", window.location.origin);
    target.searchParams.set("lang", ar ? "ar" : "en");
    void import("qrcode").then(module => module.toDataURL(target.href, {
      width: 328, margin: 4, errorCorrectionLevel: "M",
      color: { dark: "#281B35", light: "#FFFFFFFF" },
    })).then(value => { if (active) setQr(value); }).catch(() => { if (active) setQrFailed(true); });
    return () => { active = false; };
  }, [ar]);

  if (minimized) return <button type="button" className={s.launcher} onClick={() => setMinimized(false)} aria-expanded={false} aria-controls="home-app-download"><Smartphone size={18} aria-hidden="true" />{ar ? "تطبيق زوارة" : "Get the Zuwara app"}</button>;

  return <aside id="home-app-download" className={s.card} aria-labelledby="home-app-download-title" dir={ar ? "rtl" : "ltr"}>
    <button type="button" className={s.close} onClick={() => setMinimized(true)} aria-label={ar ? "تصغير بطاقة تحميل التطبيق" : "Minimize app download card"}><X size={16} /></button>
    <div className={s.heading}><span className={s.icon}><Smartphone size={19} aria-hidden="true" /></span><div><span className={s.eyebrow}>{ar ? "الرعاية بين يديك" : "CARE ON THE GO"}</span><h2 id="home-app-download-title">{ar ? "حمّل تطبيق زوارة" : "Get the Zuwara app"}</h2></div></div>
    {!qrFailed && <div className={s.scan}>
      <p>{ar ? "امسح الرمز لتحميل التطبيق" : "Scan to download the app"}</p>
      {qr ? <a href={`/api/app-download?lang=${ar ? "ar" : "en"}`} aria-label={ar ? "فتح صفحة تحميل تطبيق زوارة" : "Open the Zuwara app download page"}><Image src={qr} width={164} height={164} unoptimized alt={ar ? "رمز تحميل تطبيق زوارة لأجهزة آيفون وأندرويد" : "QR code to download Zuwara on iPhone or Android"} /></a> : <span className={s.qrPlaceholder} aria-hidden="true"><QrCode size={56} /></span>}
      <span className={s.scanHint}>{ar ? "لأجهزة آيفون وأندرويد" : "Available for iOS & Android"}</span>
    </div>}
    <div className={s.stores}>
      <a href={APP_STORE_URL} aria-label={ar ? "تحميل زوارة من آب ستور" : "Download Zuwara on the App Store"}><FaApple size={20} aria-hidden="true" /><span><small>{ar ? "حمّل من" : "Download on"}</small><strong>App Store</strong></span></a>
      <a href={GOOGLE_PLAY_URL} aria-label={ar ? "تحميل زوارة من جوجل بلاي" : "Download Zuwara on Google Play"}><FaGooglePlay size={17} aria-hidden="true" /><span><small>{ar ? "احصل عليه من" : "Get it on"}</small><strong>Google Play</strong></span></a>
    </div>
  </aside>;
}
