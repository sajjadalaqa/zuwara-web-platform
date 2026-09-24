import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/data/site";
import "./globals.css";

const manrope = localFont({
  src: [
    { path: "./fonts/Manrope-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Manrope-Medium.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Manrope-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Manrope-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-manrope",
  display: "swap",
});

const notoArabic = localFont({
  src: [
    { path: "./fonts/NotoNaskhArabic-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/NotoNaskhArabic-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Zuwara | Connected healthcare and home services", template: "%s | Zuwara" },
  description: "Discover healthcare consultants and trusted services at home through one connected Zuwara ecosystem.",
  keywords: ["Zuwara", "healthcare", "virtual consultation", "therapy", "home services", "Saudi Arabia"],
  alternates: { canonical: "/", languages: { "en-SA": "/", "ar-SA": "/ar" } },
  openGraph: { type: "website", locale: "en_SA", alternateLocale: ["ar_SA"], siteName: "Zuwara", title: "Zuwara | Healthcare and trusted services for everyday life", description: "Two focused journeys—healthcare and services at home—connected through one trusted platform.", images: [{ url: "/images/hero-doctor.png", width: 551, height: 575, alt: "Zuwara healthcare and home-services ecosystem" }] },
  twitter: { card: "summary_large_image", title: "Zuwara | Healthcare and trusted services", description: "Discover healthcare and trusted services at home through one connected Zuwara experience.", images: ["/images/hero-doctor.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#602D8C" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${manrope.variable} ${notoArabic.variable}`}><body><JsonLd data={{ "@context": "https://schema.org", "@type": "Organization", name: "Zuwara", url: SITE_URL, logo: `${SITE_URL}/brand/zuwara-logo.png`, sameAs: [] }}/><a className="skip-link" href="#main-content">Skip to content</a><Header/><main id="main-content">{children}</main><Footer/></body></html>;
}
