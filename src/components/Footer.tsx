import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import styles from "./Footer.module.css";
import { SITE_CONTACT, contactAddress } from "@/data/contact";
import { Phone, Mail, MapPin } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa6";

const contactLabels = {
  "en": {
    "heading": "Contact us",
    "phone": "Phone",
    "email": "Email",
    "address": "Operating company address"
  },
  "ar": {
    "heading": "تواصل معنا",
    "phone": "الهاتف",
    "email": "البريد الإلكتروني",
    "address": "عنوان الشركة المشغلة"
  }
};

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
      { id: "privacy", href: "/privacy-policy" },
      { id: "accountDeletion", href: "/account-deletion" },
      { id: "dataDeletion", href: "/data-deletion" },
      { id: "terms", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const contact = contactLabels[locale === "ar" ? "ar" : "en"];

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

        <section className={styles.contactArea} aria-labelledby="footer-contact-heading">
          <h3 id="footer-contact-heading" className={styles.contactHeading}>{contact.heading}</h3>
          <div className={styles.contactList}>
            <a href={SITE_CONTACT.phoneHref} className={styles.contactLink}>
              <span className={styles.contactIcon}><Phone size={18} aria-hidden="true" /></span>
              <span className={styles.contactText}><small>{contact.phone}</small><strong><bdi dir="ltr">{SITE_CONTACT.phone}</bdi></strong></span>
            </a>
            <a href={`mailto:${SITE_CONTACT.email}`} className={styles.contactLink}>
              <span className={styles.contactIcon}><Mail size={18} aria-hidden="true" /></span>
              <span className={styles.contactText}><small>{contact.email}</small><strong><bdi dir="ltr">{SITE_CONTACT.email}</bdi></strong></span>
            </a>
            <a href={SITE_CONTACT.linkedin} className={styles.contactLink} target="_blank" rel="noopener noreferrer">
              <span className={styles.contactIcon}><FaLinkedinIn size={18} aria-hidden="true" /></span>
              <span className={styles.contactText}><small>LinkedIn</small><strong><bdi dir="ltr">linkedin.com/in/zuwara</bdi></strong></span>
            </a>
            <a href={SITE_CONTACT.mapLink} className={`${styles.contactLink} ${styles.contactAddress}`} target="_blank" rel="noopener noreferrer">
              <span className={styles.contactIcon}><MapPin size={18} aria-hidden="true" /></span>
              <span className={styles.contactText}><small>{contact.address}</small><span>{contactAddress(locale).full}</span></span>
            </a>
          </div>
        </section>

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
