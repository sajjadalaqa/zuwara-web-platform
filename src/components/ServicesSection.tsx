import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import styles from "./ServicesSection.module.css";

type Category = "Telehealth" | "Home Care" | "Nursing" | "Diagnostics & Labs" | "Wellness & IV";

const services: { id: string; categories: Category[]; icon: ReactNode }[] = [
  {
    id: "virtual",
    categories: ["Telehealth"],
    icon: <><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
  },
  {
    id: "instant",
    categories: ["Telehealth"],
    icon: <><path d="M8 2v4M16 2v4" /><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M3 10h18M9 16l2 2 4-4" /></>,
  },
  {
    id: "therapy",
    categories: ["Home Care", "Wellness & IV"],
    icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M12 11v5M9.5 13.5h5" /></>,
  },
  {
    id: "caregiver",
    categories: ["Home Care"],
    icon: <><path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" /><path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" /><path d="m2 15 6 6" /><path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" /></>,
  },
  {
    id: "laboratory",
    categories: ["Diagnostics & Labs"],
    icon: <><path d="M6 18h8M3 22h18" /><path d="M14 22a7 7 0 1 0 0-14h-1" /><path d="M9 14h2" /><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z" /><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3" /></>,
  },
  {
    id: "nurse",
    categories: ["Home Care", "Nursing"],
    icon: <><path d="M5 20c-1.5 0-2-1-2-2 0-2.5 2-4 4-4h10c2 0 4 1.5 4 4 0 1-.5 2-2 2Z" /><path d="M7 14c0-3 2-6 5-6s5 3 5 6" /><path d="M12 10v3M10.5 11.5h3" /></>,
  },
  {
    id: "xray",
    categories: ["Diagnostics & Labs"],
    icon: <><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M8 22h8M12 18v4M12 8v6M9 11h6" /></>,
  },
  {
    id: "vaccination",
    categories: ["Nursing"],
    icon: <><path d="m18 2 4 4M17 7l3-3" /><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" /><path d="m9 11 4 4M5 19l-3 3M14 4l6 6" /></>,
  },
  {
    id: "iv",
    categories: ["Wellness & IV"],
    icon: <><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" /><path d="m8.5 8.5 7 7" /></>,
  },
];

export function ServicesSection() {
  const t = useTranslations("Services");

  return (
    <section className={styles.section} id="services" aria-labelledby="services-heading">
      <div className="container">
        <div className={styles.header}>
          <span className={styles.pill}>{t("pill")}</span>
          <h2 id="services-heading">{t("heading")}</h2>
          <p>{t("intro")}</p>
        </div>

        <div className={styles.grid}>
          {services.map((service) => (
            <article className={styles.item} key={service.id}>
              <span className={styles.circle}>
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{service.icon}</svg>
              </span>
              <h3>{t(`items.${service.id}.title`)}</h3>
              <p className={styles.srOnly}>{t(`items.${service.id}.description`)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
