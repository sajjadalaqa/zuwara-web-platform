import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { getD4hCategories } from "@/lib/api/d4h/catalog";
import { CategoryExplorer } from "./CategoryExplorer";
import styles from "./HomeServices.module.css";

export const metadata: Metadata = {
  title: "Home Services",
  description: "Browse active Zuwara Home Services categories and continue to trusted providers and booking journeys at your location.",
  alternates: { canonical: "/home-services" },
};

const trust = [
  { icon: "search", title: "Location-aware", text: "Results are refined by your location where supported." },
  { icon: "check", title: "Clear booking details", text: "Review the provider and booking details before you continue." },
  { icon: "shield", title: "Sign in only when needed", text: "Browse freely. Sign in at a protected action." },
] as const;

const steps = [
  { icon: "search", title: "Choose a category", text: "Start with the kind of help you need." },
  { icon: "home", title: "Refine by location", text: "Narrow results to where you are, where supported." },
  { icon: "check", title: "Review the details", text: "Check the provider and booking information." },
  { icon: "shield", title: "Sign in to continue", text: "Only when you move to a protected action." },
] as const;

const faqs = [
  { q: "Are all services available everywhere?", a: "No. Location and provider coverage determine which services are genuinely available for booking in your area." },
  { q: "Do I need an account to browse?", a: "No. You can browse categories freely and sign in only when you continue to a protected action." },
  { q: "Where do the categories come from?", a: "They are the active featured categories returned by D4H, so the list reflects what is currently offered." },
  { q: "I can't find what I need. What now?", a: "Use Post a Request to describe the service you need through the supported request journey." },
];

const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default async function HomeServicesPage() {
  const { categories } = await getD4hCategories();
  const totalServices = categories.reduce((sum, c) => sum + Number(c.serviceCount || 0), 0);

  return (
    <>
      {/* HERO */}
      <section className={`container ${styles.heroOuter}`}>
        <div className={styles.hero}>
          <span className={`${styles.orb} ${styles.orbA}`} aria-hidden />
          <span className={`${styles.orb} ${styles.orbB}`} aria-hidden />

          <div className={styles.heroGrid}>
            <div>
              <span className={`${styles.pill} ${styles.reveal}`}><Icon name="home" size={14} /> Home Services by Zuwara</span>
              <h1 className={`${styles.title} ${styles.reveal}`} style={d(1)}>
                Trusted services,<br /><em>closer to home.</em>
              </h1>
              <p className={`${styles.lead} ${styles.reveal}`} style={d(2)}>
                Browse active service categories from D4H. Location and provider coverage determine the services
                genuinely available for booking.
              </p>
              <div className={`${styles.actions} ${styles.reveal}`} style={d(3)}>
                <a href="#categories" className={styles.btnPrimary}>Browse categories <Icon name="arrow" size={17} /></a>
                <a href="#request" className={styles.btnGhost}>Post a request</a>
              </div>
            </div>

            <div className={`${styles.heroMedia} ${styles.reveal}`} style={d(2)}>
              <span className={styles.mediaBlob} aria-hidden />
              <div className={styles.photo}>
                {/* IMAGE 1: public/images/home-services/hero.jpg */}
                <Image
                  src="/images/hero.jpg"
                  alt="A caregiver supporting a patient at home"
                  fill
                  priority
                  sizes="(max-width: 900px) 90vw, 520px"
                />
              </div>
              <div className={styles.glance}>
                <div className={styles.glanceHead}>
                  <span className={styles.glanceIcon}><Icon name="home" size={16} /></span>
                  At a glance
                </div>
                <div className={styles.glanceStats}>
                  <div><strong>{categories.length}</strong><small>Active categories</small></div>
                  <div><strong>{totalServices}</strong><small>Services listed</small></div>
                </div>
              </div>
            </div>
          </div>

          <ul className={styles.trust}>
            {trust.map((t, i) => (
              <li key={t.title} className={`${styles.trustItem} ${styles.reveal}`} style={d(i)}>
                <span className={styles.trustIcon}><Icon name={t.icon} size={18} /></span>
                <div><strong>{t.title}</strong><span>{t.text}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CATEGORIES */}
      <section id="categories" className={`container ${styles.section}`}>
        {categories.length ? (
          <CategoryExplorer categories={categories} />
        ) : (
          <>
            <div className={styles.catHead}>
              <div>
                <span className={styles.eyebrow}>Categories</span>
                <h2>Find the right service for your needs</h2>
              </div>
            </div>
            <p className={styles.empty}>Service categories are temporarily unavailable.</p>
          </>
        )}
      </section>

      {/* HOW BOOKING WORKS */}
      <section id="journey" className={styles.band}>
        <div className={`container ${styles.bandGrid}`}>
          <div className={`${styles.stepsMedia} ${styles.reveal}`}>
  <span className={styles.stepsBlob} aria-hidden />
  <div className={styles.stepsFrame}>
    {/* IMAGE 2: public/images/home-services/steps.png */}
    <Image
      src="/images/steps.jpg"
      alt="Booking a home service from a phone"
      fill
      sizes="(max-width: 900px) 70vw, 420px"
      className={styles.stepsImg}
    />
  </div>
</div>

          <div>
            <div className={`${styles.heading} ${styles.reveal}`}>
              <span className={styles.eyebrow}>How booking works</span>
              <h2>Four simple steps</h2>
              <p>Choose a category, refine with your location, review the details, and sign in only when you continue.</p>
            </div>
            <ol className={styles.steps}>
              {steps.map((s, i) => (
                <li key={s.title} className={`${styles.step} ${styles.reveal}`} style={d(i)}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span className={styles.stepIcon}><Icon name={s.icon} size={20} /></span>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={`container ${styles.section}`}>
        <div className={styles.faqGrid}>
          <div className={`${styles.heading} ${styles.reveal}`}>
            <span className={styles.eyebrow}>Good to know</span>
            <h2>Frequently asked questions</h2>
            <p>Quick answers to common questions about our services and booking process.</p>
            <svg className={styles.squiggle} viewBox="0 0 90 30" width="90" height="30" fill="none" aria-hidden>
              <path d="M3 20c10-14 18 10 28-2s16-14 26-2 18 6 30-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.faq}>
            {faqs.map((f, i) => (
              <details key={f.q} className={`${styles.faqItem} ${styles.reveal}`} style={d(i)}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* POST A REQUEST */}
      <section id="request" className={`container ${styles.ctaWrap}`}>
        <div className={`${styles.cta} ${styles.reveal}`}>
          <div className={styles.ctaImg} aria-hidden>
            {/* IMAGE 3: public/images/home-services/request.png */}
            <Image src="/images/request.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 640px" />
          </div>
          <div className={styles.ctaCopy}>
            <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>Ready to get started?</span>
            <h2>Post a Request</h2>
            <p>Describe the service you need through the supported Zuwara Home Service request journey.</p>
            <Link href="/login" className={styles.ctaBtn}>Continue securely <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}