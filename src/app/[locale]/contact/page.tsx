import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { ContactForm } from "./ContactForm";
import { Glyph } from "./ContactIcons";
import styles from "./Contact.module.css";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Zuwara team. Questions, support, or want to learn more about our services? We're here to help.",
  alternates: { canonical: "/contact" },
};

// Replace with Zuwara's real details
const CONTACT = {
  phone: "+1-888-238-3997",
  email: "info@nexgenvoice.net",
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
  return (
    <>
      {/* HERO */}
      <section className={`container ${styles.heroOuter}`}>
        <div className={styles.hero}>
          <span className={`${styles.orb} ${styles.orbA}`} aria-hidden />
          <span className={`${styles.orb} ${styles.orbB}`} aria-hidden />
          <div className={styles.heroGrid}>
            <div>
              <span className={`${styles.pill} ${styles.reveal}`}><Glyph name="chat" size={14} /> Get in touch</span>
              <h1 className={`${styles.title} ${styles.reveal}`} style={d(1)}>
                We’re here<br /><em>to help you</em>
              </h1>
              <p className={`${styles.lead} ${styles.reveal}`} style={d(2)}>
                Have a question, need support, or want to learn more about our services? Our team is always here to assist you.
              </p>
              <ul className={`${styles.chips} ${styles.reveal}`} style={d(3)}>
                {chips.map((c) => (
                  <li key={c}><span><Glyph name="check" size={13} /></span>{c}</li>
                ))}
              </ul>
            </div>

            <div className={`${styles.heroMedia} ${styles.reveal}`} style={d(2)}>
              <span className={styles.mediaBlob} aria-hidden />
              <div className={styles.photo}>
                {/* IMAGE: public/images/contact/hero.jpg */}
                <Image src="/images/contact/hero.jpg" alt="A friendly Zuwara team member at a laptop" fill priority
                  sizes="(max-width: 900px) 90vw, 480px" />
              </div>
              <div className={styles.float}>
                <span className={styles.floatIcon}><Glyph name="phone" size={16} /></span>
                <div><strong>We’re just</strong><small>a message away</small></div>
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
              <span className={styles.eyebrow}>Contact details</span>
              <h2 className={styles.h2}>Get in touch with us</h2>
              <p className={styles.sub}>You can reach us through any of the following channels. We’re happy to help!</p>
            </div>

            <ul className={`${styles.info} ${styles.reveal}`} style={d(1)}>
              <li>
                <span className={styles.infoIcon}><Glyph name="phone" size={22} /></span>
                <div>
                  <small>Phone Number</small>
                  <a href={`tel:${CONTACT.phone.replace(/[^+\d]/g, "")}`}>{CONTACT.phone}</a>
                  <em>Mon – Fri, 9:00 AM – 6:00 PM (EST)</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="mail" size={22} /></span>
                <div>
                  <small>Email Address</small>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  <em>We reply within 24 hours</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="pin" size={22} /></span>
                <div>
                  <small>Our Location</small>
                  <strong>{CONTACT.street},<br />{CONTACT.cityLine}</strong>
                  <em>Visit us at our office</em>
                </div>
              </li>
              <li>
                <span className={styles.infoIcon}><Glyph name="clock" size={22} /></span>
                <div>
                  <small>Business Hours</small>
                  <strong>{CONTACT.hoursWeek}<br />{CONTACT.hoursWeekend}</strong>
                </div>
              </li>
            </ul>
          </div>

          <div className={`${styles.formCard} ${styles.reveal}`} style={d(1)}>
            <span className={styles.eyebrow}>Send us a message</span>
            <h2 className={styles.h2}>Let’s talk</h2>
            <p className={styles.sub}>Fill out the form below and we’ll get back to you as soon as possible.</p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* MAP */}
<section className={`container ${styles.mapSection}`}>
  <div className={`${styles.mapCard} ${styles.reveal}`}>
    <iframe
      title={`Map showing ${fullAddress}`}
      src={mapEmbed}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
    <div className={styles.mapLabel}>
      <strong>{CONTACT.street}</strong>
      <span>{fullAddress}</span>
      <a href={mapLink} target="_blank" rel="noopener noreferrer">View larger map</a>
    </div>
  </div>
</section>

            
    </>
  );
}