import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_INDEXABLE, SITE_URL } from "@/data/site";
import "../globals.css";
import SiteChrome from "./SiteChrome";

// Font paths now start with "../" because this file moved into [locale]
const manrope = localFont({
  src: [
    { path: "../fonts/Manrope-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/Manrope-Medium.ttf", weight: "500", style: "normal" },
    { path: "../fonts/Manrope-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../fonts/Manrope-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

const notoArabic = localFont({
  src: [
    { path: "../fonts/NotoNaskhArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "../fonts/NotoNaskhArabic-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isArabic = locale === "ar";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: "Zuwara | Connected healthcare and home services", template: "%s | Zuwara" },
    description: "Discover healthcare consultants and trusted services at home through one connected Zuwara ecosystem.",
    keywords: ["Zuwara", "healthcare", "virtual consultation", "therapy", "home services", "Saudi Arabia"],
    alternates: {
      canonical: isArabic ? "/ar" : "/",
      languages: { "en-SA": "/", "ar-SA": "/ar" },
    },
    openGraph: {
      type: "website",
      locale: isArabic ? "ar_SA" : "en_SA",
      alternateLocale: [isArabic ? "en_SA" : "ar_SA"],
      siteName: "Zuwara",
      title: "Zuwara | Healthcare and trusted services for everyday life",
      description: "Two focused journeys—healthcare and services at home—connected through one trusted platform.",
      images: [{ url: "/images/hero-doctor.png", width: 551, height: 575, alt: "Zuwara healthcare and home-services ecosystem" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Zuwara | Healthcare and trusted services",
      description: "Discover healthcare and trusted services at home through one connected Zuwara experience.",
      images: ["/images/hero-doctor.png"],
    },
    robots: SITE_INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#602D8C" };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={`${manrope.variable} ${notoArabic.variable}`}>
      <body>
        <NextIntlClientProvider>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Zuwara",
              url: SITE_URL,
              logo: `${SITE_URL}/brand/zuwara-logo.png`,
              sameAs: [],
            }}
          />
          <a className="skip-link" href="#main-content">Skip to content</a>
          <SiteChrome><Header /></SiteChrome>
<main id="main-content">{children}</main>
<SiteChrome><Footer /></SiteChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}