import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import styles from "./Footer.module.css";

const footerColumns = [
  {
    title: "Healthcare", icon: "heart",
    links: [
      { label: "Explore healthcare", href: "/healthcare" },
      { label: "Find a consultant", href: "/healthcare/doctors" },
      { label: "Therapy", href: "/services/therapy-sessions" },
      { label: "Instant consultation", href: "/services/instant-consultations" },
    ],
  },
  {
    title: "Home services", icon: "home",
    links: [
      { label: "Browse categories", href: "/home-services" },
      { label: "Service providers", href: "/home-services?view=providers" },
      { label: "Shops & labs", href: "/home-services?view=shops" },
      { label: "Post a request", href: "/home-services?view=request" },
    ],
  },
  {
    title: "Zuwara", icon: "search",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "About", href: "/about" },
      { label: "Insights", href: "/insights" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account & support", icon: "check",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Download the app", href: "/download" },
      { label: "Help center", href: "/help" },
      { label: "العربية", href: "/ar", lang: "ar" },
    ],
  },
  {
    title: "Legal", icon: "shield",
    links: [
      { label: "Privacy notice", href: "/privacy" },
      { label: "Terms of use", href: "/terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.intro}>
          <div className={styles.brand}>
            <Image className={styles.logo} src="/brand/zuwara-logo.png" alt="Zuwara" width={126} height={43} />
            <p>A connected platform for trusted healthcare and everyday services—designed around clearer choices and simpler journeys.</p>
          </div>

          <div className={styles.helpCard}>
            <div>
              <strong>Need help choosing the right journey?</strong>
              <span>Our support team can point you to the right place.</span>
            </div>
            <Link href="/help" className={styles.helpLink}>
              Visit Zuwara support <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>

        <nav className={styles.grid} aria-label="Footer">
          {footerColumns.map((column) => (
            <div className={styles.column} key={column.title}>
              <h3>
  <span className={styles.titleIcon}><Icon name={column.icon} size={16} /></span>
  {column.title}
</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} {...("lang" in link ? { lang: link.lang } : {})}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Zuwara. All rights reserved.</p>
          <p className={styles.notice}>
            <Icon name="shield" size={14} />
            Healthcare emergencies should be directed to the appropriate emergency service.
          </p>
        </div>
      </div>
    </footer>
  );
}