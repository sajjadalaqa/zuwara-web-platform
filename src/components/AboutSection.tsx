import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import styles from "./AboutSection.module.css";

const featureIds = ["patientFirst", "platforms", "staff"] as const;

function CheckCircle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function AboutSection() {
  const t = useTranslations("About");

  return (
    <section className={styles.section} id="about" aria-labelledby="about-heading">
      <div className={`container ${styles.grid}`}>
        <div className={styles.collage}>
          <div className={styles.colLeft}>
            <div className={`${styles.photo} ${styles.photoOne}`}>
              <Image src="/images/surgeons.jpg" alt={t("alt.surgeons")} fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
            <div className={`${styles.photo} ${styles.photoThree}`}>
              <Image src="/images/injection.jpg" alt={t("alt.injection")} fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
          </div>

          <div className={styles.colRight}>
            <div className={`${styles.photo} ${styles.photoTwo}`}>
              <Image src="/images/clinic.jpg" alt={t("alt.clinic")} fill sizes="(max-width: 900px) 45vw, 240px" />
            </div>
            <div className={styles.vision}>
              <span className={styles.visionPill}>{t("vision")}</span>
              <p className={styles.years}>{t("years")}</p>
              <p className={styles.visionText}>{t("visionText")}</p>
              <div className={styles.accredited}>
                <span className={styles.accreditedIcon}><CheckCircle size={20} /></span>
                <div>
                  <strong>{t("accredited")}</strong>
                  <small>{t("licenseLabel")} <bdi dir="ltr">{t("licenseNumber")}</bdi></small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.copy}>
          <span className={styles.pill}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2 4 5v6c0 5 3.4 9.2 8 11 4.6-1.8 8-6 8-11V5l-8-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            {t("pill")}
          </span>
          <h2 id="about-heading">
            {t("headingStart")} <span>{t("headingHighlight")}</span>
          </h2>
          <p className={styles.lead}>{t("lead")}</p>

          <ul className={styles.features}>
            {featureIds.map((id) => (
              <li key={id}>
                <span className={styles.featureIcon}><CheckCircle size={18} /></span>
                <div>
                  <strong>{t(`features.${id}.title`)}</strong>
                  <p>{t(`features.${id}.description`)}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/provider" className={styles.cta}>{t("cta")}</Link>
        </div>
      </div>
    </section>
  );
}