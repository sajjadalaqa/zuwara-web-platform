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


// Replace with Zuwara's real details
const CONTACT = {
  phone: "+1-888-238-3997",
  email: "example@gmail.com",
  street: "4121 NW Urbandale Dr",
  cityLine: "Urbandale, Iowa, 50322, USA",
  hoursWeek: "Mon – Fri: 9:00 AM – 6:00 PM (EST)",
  hoursWeekend: "Sat – Sun: Closed",
};

const fullAddress = `${CONTACT.street}, ${CONTACT.cityLine}`;
const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&z=14&output=embed`;
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;

const chips = ["Quick response", "Friendly support", "Your health matters"];
const d = (i: number) => ({ "--i": i }) as CSSProperties;

export default function ContactPage() {
  const uiText = useUiText();
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
                  <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`}>{CONTACT.phone}</a>
                  <em>{uiText("Mon – Fri, 9:00 AM – 6:00 PM (EST)")}</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="mail" size={22} /></span>
                <div>
                  <small>{uiText("Email Address")}</small>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  <em>{uiText("We reply within 24 hours")}</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="pin" size={22} /></span>
                <div>
                  <small>{uiText("Our Location")}</small>
                  <strong>{CONTACT.street},<br />{CONTACT.cityLine}</strong>
                  <em>{uiText("Visit us at our office")}</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="clock" size={22} /></span>
                <div>
                  <small>{uiText("Business Hours")}</small>
                  <strong>{uiText(CONTACT.hoursWeek)}<br />{uiText(CONTACT.hoursWeekend)}</strong>
                </div>
              </li>
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
      <strong>{CONTACT.street}</strong>
      <span>{fullAddress}</span>
      <a href={mapLink} target="_blank" rel="noopener noreferrer">{uiText("View larger map")}</a>
    </div>
  </div>
</section>

            
    </>
  );
}