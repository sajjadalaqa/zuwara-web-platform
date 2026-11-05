import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/data/site";

export function appDownloadDestination(userAgent: string, locale = "en"): string {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return APP_STORE_URL;
  if (/Android/i.test(userAgent)) return GOOGLE_PLAY_URL;
  return locale === "ar" ? "/ar/download" : "/download";
}
