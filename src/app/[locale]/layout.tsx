import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_INDEXABLE, SITE_URL } from "@/data/site";
import SiteChrome from "./SiteChrome";
import LocaleDocument from "./LocaleDocument";

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
    <NextIntlClientProvider>
          <LocaleDocument locale={locale} />
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
  );
}