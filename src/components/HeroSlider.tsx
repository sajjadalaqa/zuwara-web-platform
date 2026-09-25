"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Icon } from "./Icon";
import { UnifiedDiscovery } from "./UnifiedDiscovery";
import searchStyles from "@/app/home-hero.module.css";
import styles from "./HeroSlider.module.css";

const SLIDE_DURATION = 8000;
const slides = [
  { label: "Welcome to Zuwara", eyebrow: "Care that fits your everyday", title: "For your health.\nFor your home.", description: "Find a consultant, arrange a visit, or get a little help at home. Your next step starts here.", href: "/healthcare", action: "Explore Zuwara", image: "/images/hero-doctor.png", alt: "A Zuwara healthcare consultant", theme: "welcome" },
  { label: "Healthcare", eyebrow: "Someone to turn to", title: "Let’s find the right\ncare for you.", description: "Get to know our consultants, explore specialties, and choose an appointment that works for you.", href: "/healthcare/doctors", action: "Find a consultant", image: "/images/therapy-consultant-transparent.png", alt: "A healthcare consultant ready for a consultation", theme: "health" },
  { label: "Home services", eyebrow: "A helping hand at home", title: "Your everyday needs.\nA little less to do.", description: "Explore services and providers in your area, arrange the support you need, and keep track of your bookings.", href: "/home-services", action: "Explore home services", theme: "home" },
] as const;

function subscribeToMotionPreference(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

export function HeroSlider({ welcomeBanner }: { welcomeBanner?: string }) {
  const [active, setActive] = useState(0);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => false);

  useEffect(() => {
    if (reducedMotion) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(() => setActive((current) => (current + 1) % slides.length), SLIDE_DURATION);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [active, reducedMotion]);

  function selectSlide(index: number) {
    setActive((index + slides.length) % slides.length);
  }

  return (
    <section className={`${searchStyles.hero} ${styles.hero}`} aria-label="Healthcare and home services">
      <h1 className={styles.srOnly}>Zuwara — care for your health and your home</h1>
      <div className="container">
        <div role="region" aria-roledescription="carousel" aria-label="Explore Zuwara">
          <div className={styles.stage} aria-live={reducedMotion ? "polite" : "off"}>
            {slides.map((slide, index) => (
              <div key={slide.theme} className={`${styles.slide} ${styles[slide.theme]} ${active === index ? styles.active : ""}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}: ${slide.label}`} aria-hidden={active !== index} inert={active !== index}>
                {index === 0 && welcomeBanner ? (
                  <Link className={styles.banner} href="/healthcare" aria-label="Welcome to Zuwara. Explore healthcare">
                    <Image src={welcomeBanner} alt="مرحباً بك في زوارة — استشارات عن بُعد، زيارات منزلية ورعاية شاملة. ابدأ الآن." fill sizes="(max-width: 1288px) 100vw, 1240px" preload />
                    <span className={styles.bannerCaption}>Welcome to Zuwara <span>Explore healthcare <Icon name="arrow" size={18} /></span></span>
                  </Link>
                ) : (
                  <>
                    <div className={styles.copy}>
                      <span className={styles.eyebrow}>{slide.eyebrow}</span>
                      <h2>{slide.title}</h2>
                      <p>{slide.description}</p>
                      <Link href={slide.href} className={styles.action}>{slide.action}<Icon name="arrow" size={18} /></Link>
                    </div>
                    {"image" in slide ? (
                      <div className={styles.portrait}>
                        <div className={styles.arch} />
                        <Image src={slide.image} alt={slide.alt} fill sizes="(max-width: 640px) 70vw, (max-width: 900px) 45vw, 500px" preload={index === 0} />
                        <span className={styles.imageNote}><Icon name={index === 0 ? "heart" : "video"} size={18} />{index === 0 ? "Here for your everyday" : "Care, on your terms"}</span>
                      </div>
                    ) : (
                      <div className={styles.homeVisual} aria-label="Discover, book and track services at home">
                        <div className={styles.homeMark}><Icon name="home" size={64} /></div>
                        <div className={styles.serviceNote}><span><Icon name="location" size={21} /></span><div><strong>Find support nearby</strong><small>Explore services in your area</small></div></div>
                        <div className={styles.serviceNote}><span><Icon name="calendar" size={21} /></span><div><strong>Make room for your day</strong><small>Arrange your service booking</small></div></div>
                        <div className={styles.serviceNote}><span><Icon name="check" size={21} /></span><div><strong>Stay in the loop</strong><small>Keep track from your account</small></div></div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <div className={styles.controls}>
            <div className={styles.dots} aria-label="Choose a slide">
              {slides.map((slide, index) => <button key={slide.theme} type="button" aria-label={`Show slide ${index + 1}: ${slide.label}`} aria-current={active === index ? "true" : undefined} onClick={() => selectSlide(index)}><span /></button>)}
            </div>
          </div>
        </div>
        <div className={styles.searchArea}>
          <div className={styles.searchHeading}><strong>What can we help you with?</strong><span>Choose a service to get started.</span></div>
          <UnifiedDiscovery />
        </div>
      </div>
    </section>
  );
}
