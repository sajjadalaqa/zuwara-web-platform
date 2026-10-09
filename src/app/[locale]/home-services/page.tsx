import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { getD4hCategories } from "@/lib/api/d4h/catalog";
import { CategoryExplorer } from "./CategoryExplorer";
import styles from "./HomeServices.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomeServices.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/home-services" },
  };
}

const trustItems = [
  { id: "location", icon: "search" },
  { id: "clear", icon: "check" },
  { id: "signin", icon: "shield" },
] as const;

const stepItems = [
  { id: "choose", icon: "search" },
  { id: "refine", icon: "home" },
  { id: "review", icon: "check" },
  { id: "signin", icon: "shield" },
] as const;

const faqIds = ["everywhere", "account", "source", "missing"] as const;

const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default async function HomeServicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomeServices");

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
              <span className={`${styles.pill} ${styles.reveal}`}><Icon name="home" size={14} /> {t("hero.pill")}</span>
              <h1 className={`${styles.title} ${styles.reveal}`} style={d(1)}>
                {t("hero.titleLine1")}<br /><em>{t("hero.titleAccent")}</em>
              </h1>
              <p className={`${styles.lead} ${styles.reveal}`} style={d(2)}>{t("hero.lead")}</p>
              <div className={`${styles.actions} ${styles.reveal}`} style={d(3)}>
                <a href="#categories" className={styles.btnPrimary}>{t("hero.browse")} <Icon name="arrow" size={17} /></a>
                <a href="#request" className={styles.btnGhost}>{t("hero.request")}</a>
              </div>
            </div>

            <div className={`${styles.heroMedia} ${styles.reveal}`} style={d(2)}>
              <span className={styles.mediaBlob} aria-hidden />
              <div className={styles.photo}>
                <Image
                  src="/images/hero.jpg"
                  alt={t("hero.photoAlt")}
                  fill
                  priority
                  sizes="(max-width: 900px) 90vw, 520px"
                />
              </div>
              <div className={styles.glance}>
                <div className={styles.glanceHead}>
                  <span className={styles.glanceIcon}><Icon name="home" size={16} /></span>
                  {t("hero.glance")}
                </div>
                <div className={styles.glanceStats}>
                  <div><strong>{categories.length}</strong><small>{t("hero.activeCategories")}</small></div>
                  <div><strong>{totalServices}</strong><small>{t("hero.servicesListed")}</small></div>
                </div>
              </div>
            </div>
          </div>

          <ul className={styles.trust}>
            {trustItems.map(({ id, icon }, i) => (
              <li key={id} className={`${styles.trustItem} ${styles.reveal}`} style={d(i)}>
                <span className={styles.trustIcon}><Icon name={icon} size={18} /></span>
                <div><strong>{t(`trust.${id}.title`)}</strong><span>{t(`trust.${id}.text`)}</span></div>
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
                <span className={styles.eyebrow}>{t("categories.eyebrow")}</span>
                <h2>{t("categories.title")}</h2>
              </div>
            </div>
            <p className={styles.empty}>{t("categories.empty")}</p>
          </>
        )}
      </section>

      {/* HOW BOOKING WORKS */}
      <section id="journey" className={styles.band}>
        <div className={`container ${styles.bandGrid}`}>
          <div className={`${styles.stepsMedia} ${styles.reveal}`}>
            <span className={styles.stepsBlob} aria-hidden />
            <div className={styles.stepsFrame}>
              <Image
                src="/images/steps.jpg"
                alt={t("journey.imageAlt")}
                fill
                sizes="(max-width: 900px) 70vw, 420px"
                className={styles.stepsImg}
              />
            </div>
          </div>

          <div>
            <div className={`${styles.heading} ${styles.reveal}`}>
              <span className={styles.eyebrow}>{t("journey.eyebrow")}</span>
              <h2>{t("journey.title")}</h2>
              <p>{t("journey.intro")}</p>
            </div>
            <ol className={styles.steps}>
              {stepItems.map(({ id, icon }, i) => (
                <li key={id} className={`${styles.step} ${styles.reveal}`} style={d(i)}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  <span className={styles.stepIcon}><Icon name={icon} size={20} /></span>
                  <strong>{t(`journey.${id}.title`)}</strong>
                  <p>{t(`journey.${id}.text`)}</p>
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
            <span className={styles.eyebrow}>{t("faq.eyebrow")}</span>
            <h2>{t("faq.title")}</h2>
            <p>{t("faq.intro")}</p>
            <svg className={styles.squiggle} viewBox="0 0 90 30" width="90" height="30" fill="none" aria-hidden>
              <path d="M3 20c10-14 18 10 28-2s16-14 26-2 18 6 30-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className={styles.faq}>
            {faqIds.map((id, i) => (
              <details key={id} className={`${styles.faqItem} ${styles.reveal}`} style={d(i)}>
                <summary>{t(`faq.items.${id}.q`)}</summary>
                <p>{t(`faq.items.${id}.a`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* POST A REQUEST */}
      <section id="request" className={`container ${styles.ctaWrap}`}>
        <div className={`${styles.cta} ${styles.reveal}`}>
          <div className={styles.ctaImg} aria-hidden>
            <Image src="/images/request.jpg" alt="" fill sizes="(max-width: 760px) 100vw, 640px" />
          </div>
          <div className={styles.ctaCopy}>
            <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>{t("cta.eyebrow")}</span>
            <h2>{t("cta.title")}</h2>
            <p>{t("cta.text")}</p>
            <Link href="/login" className={styles.ctaBtn}>{t("cta.button")} <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>
    </>
  );
}