"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { UnifiedDiscovery } from "./UnifiedDiscovery";
import searchStyles from "@/app/home-hero.module.css";
import styles from "./HeroSlider.module.css";

const SLIDE_DURATION = 6000;

type Slide = {
  label: { en: string; ar: string };
  href: string; // without locale prefix
  image: string;
  ratio: string; // desktop/tablet image: "width / height"
  mobileImage?: string;
  mobileRatio?: string; // phone image: "width / height" (falls back to ratio)
  alt: { en: string; ar: string };
  position?: string;
};

const slides: Slide[] = [
  {
    label: { en: "Welcome to Zuwara", ar: "مرحباً بك في زوارة" },
    href: "/healthcare",
    image: "/images/hero-1.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Welcome to Zuwara. Care for your health and your home.",
      ar: "مرحباً بك في زوارة. نعتني بصحتك ومنزلك.",
    },
  },
  {
    label: { en: "Healthcare", ar: "الرعاية الصحية" },
    href: "/healthcare/doctors",
    image: "/images/hero-2.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Find the right healthcare consultant for you.",
      ar: "اعثر على المستشار الصحي المناسب لك.",
    },
  },
  {
    label: { en: "Home services", ar: "الخدمات المنزلية" },
    href: "/home-services",
    image: "/images/hero-3.jpg",
    ratio: "9600 / 3600",
    alt: {
      en: "Explore trusted home services in your area.",
      ar: "استكشف الخدمات المنزلية الموثوقة في منطقتك.",
    },
  },
];

const copy = {
  en: {
    section: "Healthcare and home services",
    srTitle: "Zuwara — care for your health and your home",
    carousel: "Explore Zuwara",
    chooseSlide: "Choose a slide",
    showSlide: "Show slide",
    slideOf: "of",
    helpTitle: "What can we help you with?",
    helpSub: "Choose a service to get started.",
  },
  ar: {
    section: "الرعاية الصحية والخدمات المنزلية",
    srTitle: "زوارة — نعتني بصحتك ومنزلك",
    carousel: "استكشف زوارة",
    chooseSlide: "اختر شريحة",
    showSlide: "عرض الشريحة",
    slideOf: "من",
    helpTitle: "كيف يمكننا مساعدتك؟",
    helpSub: "اختر خدمة للبدء.",
  },
};

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroSlider() {
  const params = useParams<{ locale?: string }>();
  const isAr = params?.locale === "ar";
  const t = isAr ? copy.ar : copy.en;
  const prefix = isAr ? "/ar" : "";
  const lang = isAr ? "ar" : "en";

  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  );

  useEffect(() => {
    if (reducedMotion) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden) {
        timer = setTimeout(() => setActive((c) => (c + 1) % slides.length), SLIDE_DURATION);
      }
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [active, reducedMotion]);

  return (
    <section className={`${searchStyles.hero} ${styles.hero}`} aria-label={t.section}>
      <h1 className={styles.srOnly}>{t.srTitle}</h1>
      <div className="container">
        <div role="region" aria-roledescription="carousel" aria-label={t.carousel}>
          <div
            className={styles.stage}
            aria-live={reducedMotion ? "polite" : "off"}
            style={
              {
                "--ratio": slides[active].ratio,
                "--ratio-mobile": slides[active].mobileRatio ?? slides[active].ratio,
              } as React.CSSProperties
            }
          >
            {slides.map((slide, index) => (
              <Link
                key={slide.href}
                href={`${prefix}${slide.href}`}
                className={`${styles.slide} ${active === index ? styles.active : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} ${t.slideOf} ${slides.length}: ${slide.label[lang]}`}
                aria-hidden={active !== index}
                inert={active !== index}
                tabIndex={active === index ? 0 : -1}
              >
                {/* Desktop / tablet image */}
                <Image
                  src={slide.image}
                  alt={slide.alt[lang]}
                  fill
                  sizes="(max-width: 1288px) 100vw, 1240px"
                  priority={index === 0}
                  className={`${styles.img} ${slide.mobileImage ? styles.imgDesktop : ""}`}
                  style={{ objectPosition: slide.position ?? "center" }}
                />
                {/* Optional mobile image */}
                {slide.mobileImage && (
                  <Image
                    src={slide.mobileImage}
                    alt={slide.alt[lang]}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className={`${styles.img} ${styles.imgMobile}`}
                    style={{ objectPosition: slide.position ?? "center" }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className={styles.controls}>
            <div className={styles.dots} aria-label={t.chooseSlide}>
              {slides.map((slide, index) => (
                <button
                  key={slide.href}
                  type="button"
                  aria-label={`${t.showSlide} ${index + 1}: ${slide.label[lang]}`}
                  aria-current={active === index ? "true" : undefined}
                  onClick={() => setActive(index)}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.searchArea}>
          <div className={styles.searchHeading}>
            <strong>{t.helpTitle}</strong>
            <span>{t.helpSub}</span>
          </div>
          <UnifiedDiscovery />
        </div>
      </div>
    </section>
  );
}