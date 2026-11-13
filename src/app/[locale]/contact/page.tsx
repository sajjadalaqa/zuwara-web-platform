import { useLocale } from "next-intl";
import { FaLinkedinIn } from "react-icons/fa6";
import { SITE_CONTACT, contactAddress } from "@/data/contact";
import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ContactForm } from "./ContactForm";
import { Glyph } from "./ContactIcons";
import styles from "./Contact.module.css";

const pageMetadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Zuwara team. Questions, support, or want to learn more about our services? We're here to help.",
  alternates: { canonical: "/contact" },
};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


const CONTACT = SITE_CONTACT;
const mapLink = SITE_CONTACT.mapLink;

const chips = ["Quick response", "Friendly support", "Your health matters"];
const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default function ContactPage() {
  const uiText = useUiText();
  const locale = useLocale();
  const address = contactAddress(locale);
  const fullAddress = address.full;
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(SITE_CONTACT.address.en.full)}&z=16&output=embed`;
  return (
    <>
      {/* HERO */}
      <section className={`container ${styles.heroOuter}`}>
        <div className={styles.hero}>
          <span className={`${styles.orb} ${styles.orbA}`} aria-hidden />
          <span className={`${styles.orb} ${styles.orbB}`} aria-hidden />
          <div className={styles.heroGrid}>
            <div>
              <span className={`${styles.pill} ${styles.reveal}`}><Glyph name="chat" size={14} /> {uiText("Get in touch")}</span>
              <h1 className={`${styles.title} ${styles.reveal}`} style={d(1)}>
                {uiText("We’re here")}<br /><em>{uiText("to help you")}</em>
              </h1>
              <p className={`${styles.lead} ${styles.reveal}`} style={d(2)}>
                {uiText("Have a question, need support, or want to learn more about our services? Our team is always here to assist you.")}{" "}</p>
              <ul className={`${styles.chips} ${styles.reveal}`} style={d(3)}>
                {chips.map((c) => (
                  <li key={c}><span><Glyph name="check" size={13} /></span>{uiText(c)}</li>
                ))}
              </ul>
            </div>

            <div className={`${styles.heroMedia} ${styles.reveal}`} style={d(2)}>
              <span className={styles.mediaBlob} aria-hidden />
              <div className={styles.photo}>
                {/* IMAGE: public/images/contact/hero.jpg */}
                <Image src="/images/contact/hero.jpg" alt={uiText("A friendly Zuwara team member at a laptop")} fill priority
                  sizes="(max-width: 900px) 90vw, 480px" />
              </div>
              <div className={styles.float}>
                <span className={styles.floatIcon}><Glyph name="phone" size={16} /></span>
                <div><strong>{uiText("We’re just")}</strong><small>{uiText("a message away")}</small></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS + FORM */}
      <section className={`container ${styles.section}`}>
        <div className={styles.split}>
          <div>
            <div className={styles.reveal}>
              <span className={styles.eyebrow}>{uiText("Contact details")}</span>
              <h2 className={styles.h2}>{uiText("Get in touch with us")}</h2>
              <p className={styles.sub}>{uiText("You can reach us through any of the following channels. We’re happy to help!")}</p>
            </div>

            <ul className={`${styles.info} ${styles.reveal}`} style={d(1)}>
              <li>
                <span className={styles.infoIcon}><Glyph name="phone" size={22} /></span>
                <div>
                  <small>{uiText("Phone Number")}</small>
                  <a href={CONTACT.phoneHref} dir="ltr">{CONTACT.phone}</a>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="mail" size={22} /></span>
                <div>
                  <small>{uiText("Email Address")}</small>
                  <a href={`mailto:${CONTACT.email}`} dir="ltr">{CONTACT.email}</a>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="pin" size={22} /></span>
                <div>
                  <small>{uiText("Our Location")}</small>
                  <strong>{address.street},<br />{address.cityLine}</strong>
                  <em>{SITE_CONTACT.company[locale === "ar" ? "ar" : "en"]}</em>
                </div>
              </li>
              <li><span className={styles.infoIcon}><FaLinkedinIn size={22} aria-hidden="true" /></span><div><small>LinkedIn</small><a href={SITE_CONTACT.linkedin} target="_blank" rel="noopener noreferrer" dir="ltr">linkedin.com/in/zuwara</a></div></li>
            </ul>
          </div>

          <div className={`${styles.formCard} ${styles.reveal}`} style={d(1)}>
            <span className={styles.eyebrow}>{uiText("Send us a message")}</span>
            <h2 className={styles.h2}>{uiText("Let’s talk")}</h2>
            <p className={styles.sub}>{uiText("Fill out the form below and we’ll get back to you as soon as possible.")}</p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* MAP */}
<section className={`container ${styles.mapSection}`}>
  <div className={`${styles.mapCard} ${styles.reveal}`}>
    <iframe
      title={`${uiText("Map showing")} ${fullAddress}`}
      src={mapEmbed}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
    <div className={styles.mapLabel}>
      <strong>{address.street}</strong>
      <span>{fullAddress}</span>
      <a href={mapLink} target="_blank" rel="noopener noreferrer">{uiText("View larger map")}</a>
    </div>
  </div>
</section>

            
    </>
  );
}