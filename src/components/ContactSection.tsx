"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "./Icon";
import { submitContact, validateContact, type ContactErrors, type ContactPayload } from "@/lib/contact";
import styles from "./ContactSection.module.css";

type Status = "idle" | "submitting" | "success" | "error";

const topics = [
  "Booking and appointments",
  "Payments and confirmations",
  "Account and profile help",
];

function FieldIcon({ name }: { name: "user" | "phone" | "mail" | "chat" }) {
  const paths = {
    user: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zm0 2c-4.1 0-7.5 2.2-7.5 5v1.5h15V19c0-2.8-3.4-5-7.5-5z",
    phone: "M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25c1.1.37 2.3.57 3.6.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.3.2 2.5.57 3.6a1 1 0 0 1-.25 1L6.6 10.8z",
    mail: "M3 5.5h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zm9 6.2 8.2-4.7H3.8L12 11.7zm0 2.3L3.5 9.1V17h17V9.1L12 14z",
    chat: "M4 4h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4.3 3.4A.5.5 0 0 1 3 20V5a1 1 0 0 1 1-1z",
  } as const;

  return (
    <svg className={styles.fieldIcon} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

export function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactErrors>({});
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload: ContactPayload = {
      firstName: String(data.get("firstName") ?? ""),
      lastName: String(data.get("lastName") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    const clientErrors = validateContact(payload);
    setErrors(clientErrors);
    setFormError("");
    if (Object.keys(clientErrors).length > 0) {
      setStatus("idle");
      return;
    }

    setStatus("submitting");
    const result = await submitContact(payload);

    if (result.ok) {
      form.reset();
      setStatus("success");
      return;
    }

    setErrors(result.fieldErrors ?? {});
    setFormError(result.error);
    setStatus("error");
  }

  const submitting = status === "submitting";

  return (
    <section className={styles.section} aria-labelledby="contact-heading" id="contact">
      <div className={`container ${styles.inner}`}>
        <div className={styles.panel}>
          {/* ---------- left: info ---------- */}
          <aside className={styles.info}>
            <span className={styles.eyebrow}><i /> Contact us</span>
            <h2 id="contact-heading">
              We’re here to <span>help you.</span>
            </h2>
            <p>Have a question about a booking, a payment or your account? Send us a message and our team will get back to you.</p>

            <ul className={styles.topics}>
              {topics.map((topic) => (
                <li key={topic}>
                  <span><Icon name="check" size={12} /></span>
                  {topic}
                </li>
              ))}
            </ul>
          </aside>

          {/* ---------- right: form ---------- */}
          <div className={styles.formWrap}>
            {status === "success" ? (
              <div className={styles.success} role="status">
                <span className={styles.successIcon}><Icon name="check" size={28} /></span>
                <h3>Thank you, your message is sent.</h3>
                <p>We’ve received your message and will get back to you soon.</p>
                <button type="button" className={styles.again} onClick={() => setStatus("idle")}>
                  Send another message
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit} noValidate aria-busy={submitting}>
                <div className={styles.formHead}>
                  <h3>Send us a message</h3>
                  <p>All fields are required.</p>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="contact-first-name">First name</label>
                    <div className={`${styles.control} ${errors.firstName ? styles.invalid : ""}`}>
                      <FieldIcon name="user" />
                      <input id="contact-first-name" name="firstName" type="text" autoComplete="given-name" placeholder="Your first name" aria-invalid={!!errors.firstName} aria-describedby={errors.firstName ? "err-first" : undefined} />
                    </div>
                    {errors.firstName && <span className={styles.error} id="err-first">{errors.firstName}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="contact-last-name">Last name</label>
                    <div className={`${styles.control} ${errors.lastName ? styles.invalid : ""}`}>
                      <FieldIcon name="user" />
                      <input id="contact-last-name" name="lastName" type="text" autoComplete="family-name" placeholder="Your last name" aria-invalid={!!errors.lastName} aria-describedby={errors.lastName ? "err-last" : undefined} />
                    </div>
                    {errors.lastName && <span className={styles.error} id="err-last">{errors.lastName}</span>}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="contact-phone">Phone number</label>
                    <div className={`${styles.control} ${errors.phone ? styles.invalid : ""}`}>
                      <FieldIcon name="phone" />
                      <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="Your phone number" aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "err-phone" : undefined} />
                    </div>
                    {errors.phone && <span className={styles.error} id="err-phone">{errors.phone}</span>}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="contact-email">Email address</label>
                    <div className={`${styles.control} ${errors.email ? styles.invalid : ""}`}>
                      <FieldIcon name="mail" />
                      <input id="contact-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? "err-email" : undefined} />
                    </div>
                    {errors.email && <span className={styles.error} id="err-email">{errors.email}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-message">Message</label>
                  <div className={`${styles.control} ${styles.textarea} ${errors.message ? styles.invalid : ""}`}>
                    <FieldIcon name="chat" />
                    <textarea id="contact-message" name="message" rows={5} placeholder="How can we help you?" aria-invalid={!!errors.message} aria-describedby={errors.message ? "err-message" : undefined} />
                  </div>
                  {errors.message && <span className={styles.error} id="err-message">{errors.message}</span>}
                </div>

                {/* Spam trap: hidden from real visitors, keep it empty */}
                <div className={styles.trap} aria-hidden="true">
                  <label htmlFor="contact-website">Website</label>
                  <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                {formError && <div className={styles.alert} role="alert">{formError}</div>}

                <button type="submit" className={styles.submit} disabled={submitting}>
                  {submitting ? (
                    <><span className={styles.spinner} aria-hidden="true" /> Sending…</>
                  ) : (
                    <>Send message <Icon name="arrow" size={16} /></>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}