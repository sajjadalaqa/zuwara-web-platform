import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import styles from "./Footer.module.css";

const footerColumns = [
  {
    id: "healthcare", icon: "heart",
    links: [
      { id: "explore", href: "/healthcare" },
      { id: "consultant", href: "/healthcare/doctors" },
      { id: "therapy", href: "/services/therapy-sessions" },
      { id: "instant", href: "/services/instant-consultations" },
    ],
  },
  {
    id: "homeServices", icon: "home",
    links: [
      { id: "categories", href: "/home-services" },
      { id: "providers", href: "/home-services?view=providers" },
      { id: "shops", href: "/home-services?view=shops" },
      { id: "request", href: "/home-services?view=request" },
    ],
  },
  {
    id: "zuwara", icon: "search",
    links: [
      { id: "how", href: "/how-it-works" },
      { id: "about", href: "/about" },
      { id: "insights", href: "/insights" },
      { id: "contact", href: "/contact" },
    ],
  },
  {
    id: "account", icon: "check",
    links: [
      { id: "signin", href: "/login" },
      { id: "download", href: "/download" },
      { id: "help", href: "/help" },
    ],
  },
  {
    id: "legal", icon: "shield",
    links: [
      { id: "privacy", href: "/privacy" },
      { id: "terms", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const otherLocale = locale === "ar" ? "en" : "ar";

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <div className={styles.brand}>
            <Image className={styles.logo} src="/brand/zuwara-logo.png" alt={t("logoAlt")} width={126} height={43} />
            <p>{t("about")}</p>
          </div>

          <div className={styles.helpCard}>
            <div>
              <strong>{t("helpTitle")}</strong>
              <span>{t("helpText")}</span>
            </div>
            <Link href="/help" className={styles.helpLink}>
              {t("helpLink")} <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>

        <nav className={styles.grid} aria-label={t("navLabel")}>
          {footerColumns.map((column) => (
            <div className={styles.column} key={column.id}>
              <h3>
                <span className={styles.titleIcon}><Icon name={column.icon} size={16} /></span>
                {t(`columns.${column.id}.title`)}
              </h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link href={link.href}>{t(`columns.${column.id}.links.${link.id}`)}</Link>
                  </li>
                ))}

                {/* Language switch lives at the end of the "Account & support" column */}
                {column.id === "account" && (
                  <li>
                    <Link href="/" locale={otherLocale} lang={otherLocale}>
                      {t("language")}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <p>{t("copyright", { year: String(new Date().getFullYear()) })}</p>
          <p className={styles.notice}>
            <Icon name="shield" size={14} />
            {t("notice")}
          </p>
        </div>
      </div>
    </footer>
  );
}