import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/data/site";
import AppLaunch from "./AppLaunch";

export const metadata: Metadata = {
  title: "Zuwara App",
  robots: { index: false, follow: true },
};

// Switch to "home" after the Flutter release that supports that destination.
const appDestination = "doctor-profile";
const appUrl = `zuwara://${appDestination}`;
const androidIntent = `intent://${appDestination}#Intent;scheme=zuwara;package=com.zuwara.patient.flutter.app;S.browser_fallback_url=${encodeURIComponent(GOOGLE_PLAY_URL)};end`;

export default async function AppPage() {
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()]);
  const userAgent = requestHeaders.get("user-agent") ?? "";
  const isIos = /iPhone|iPad|iPod|Macintosh.*Mobile/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isArabic = requestCookies.get("NEXT_LOCALE")?.value !== "en";
  const openUrl = isAndroid ? androidIntent : isIos ? appUrl : undefined;
  const copy = isArabic
    ? { title: "تطبيق زوارة", open: "افتح التطبيق", prompt: "افتح تطبيق زوارة أو حمّله من متجر جهازك.", download: "حمّل تطبيق زوارة من متجر جهازك." }
    : { title: "Zuwara App", open: "Open App", prompt: "Open Zuwara or download it from your device’s store.", download: "Download Zuwara from your device’s store." };
  const apple = { label: "App Store", url: APP_STORE_URL };
  const google = { label: "Google Play", url: GOOGLE_PLAY_URL };
  const stores = isAndroid ? [google, apple] : [apple, google];

  return (
    <main className="content-section" lang={isArabic ? "ar" : "en"} dir={isArabic ? "rtl" : "ltr"}>
      <div className="container">
        <h1>{copy.title}</h1>
        <p>{openUrl ? copy.prompt : copy.download}</p>
        <div className="hero-actions">
          {openUrl && <AppLaunch launchUrl={appUrl} openUrl={openUrl} label={copy.open} />}
          {stores.map(({ label, url }, index) => (
            <a
              key={label}
              href={url}
              className={index === 0 && !openUrl ? "button button-primary" : "button button-secondary"}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
