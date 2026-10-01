"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { UnifiedDiscovery } from "./UnifiedDiscovery";
import searchStyles from "@/app/home-hero.module.css";
import styles from "./HeroSlider.module.css";

const SLIDE_DURATION = 6000;

type Slide = {
  label: string;
  href: string;
  image: string;
  ratio: string;          // desktop/tablet image: "width / height"
  mobileImage?: string;
  mobileRatio?: string;   // phone image: "width / height" (falls back to ratio)
  alt: string;
  position?: string;
};

const slides: Slide[] = [
  {
  label: "Welcome to Zuwara",
  href: "/healthcare",
  image: "/images/hero-1.jpg",
  ratio: "9600 / 3600",
  alt: "Welcome to Zuwara. Care for your health and your home.",
},
    {
    label: "Healthcare",
    href: "/healthcare/doctors",
    image: "/images/hero-2.jpg",
    ratio: "9600 / 3600",
    alt: "Find the right healthcare consultant for you.",
  },
  {
    label: "Home services",
    href: "/home-services",
    image: "/images/hero-3.jpg",
    ratio: "9600 / 3600",
    alt: "Explore trusted home services in your area.",
  },
    
];

  

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroSlider() {
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
    <section className={`${searchStyles.hero} ${styles.hero}`} aria-label="Healthcare and home services">
      <h1 className={styles.srOnly}>Zuwara — care for your health and your home</h1>
      <div className="container">
        <div role="region" aria-roledescription="carousel" aria-label="Explore Zuwara">
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
                href={slide.href}
                className={`${styles.slide} ${active === index ? styles.active : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${slide.label}`}
                aria-hidden={active !== index}
                inert={active !== index}
                tabIndex={active === index ? 0 : -1}
              >
                {/* Desktop / tablet image */}
                <Image
                  src={slide.image}
                  alt={slide.alt}
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
                    alt={slide.alt}
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
            <div className={styles.dots} aria-label="Choose a slide">
              {slides.map((slide, index) => (
                <button
                  key={slide.href}
                  type="button"
                  aria-label={`Show slide ${index + 1}: ${slide.label}`}
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
            <strong>What can we help you with?</strong>
            <span>Choose a service to get started.</span>
          </div>
          <UnifiedDiscovery />
        </div>
      </div>
    </section>
  );
}