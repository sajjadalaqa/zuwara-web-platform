"use client";

import { useState, type FormEvent } from "react";
import { Glyph } from "./ContactIcons";
import styles from "./Contact.module.css";

type Fields = { firstName: string; lastName: string; email: string; phone: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status = "idle" | "sending" | "success" | "error";

const empty: Fields = { firstName: "", lastName: "", email: "", phone: "", message: "" };

function validate(v: Fields): Errors {
  const e: Errors = {};
  if (!v.firstName.trim()) e.firstName = "Please enter your first name.";
  if (!v.lastName.trim()) e.lastName = "Please enter your last name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!/^[+\d][\d\s\-()]{6,}$/.test(v.phone.trim())) e.phone = "Enter a valid phone number.";
  if (v.message.trim().length < 10) e.message = "Please tell us a little more (at least 10 characters).";
  return e;
}

export function ContactForm() {
  const [values, setValues] = useState<Fields>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [trap, setTrap] = useState("");

  const set = (key: keyof Fields) => (ev: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [key]: ev.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (status === "sending") return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: trap }),
      });
      if (!res.ok) throw new Error("Request failed");
      setValues(empty);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}><Glyph name="check" size={28} /></span>
        <h3>Message sent</h3>
        <p>Thank you for reaching out. Our team will get back to you as soon as possible.</p>
        <button type="button" className={styles.ghostBtn} onClick={() => setStatus("idle")}>
          Send another message
        </button>
      </div>
    );
  }

  const field = (
    key: keyof Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className={styles.field}>
      <label htmlFor={key}>{label} <span aria-hidden="true">*</span></label>
      <input
        id={key} name={key} value={values[key]} onChange={set(key)} required
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        {...props}
      />
      {errors[key] && <small id={`${key}-error`} className={styles.fieldError}>{errors[key]}</small>}
    </div>
  );

  return (
    <form onSubmit={onSubmit} noValidate className={styles.form}>
      <div className={styles.row}>
        {field("firstName", "First Name", { placeholder: "Enter your first name", autoComplete: "given-name" })}
        {field("lastName", "Last Name", { placeholder: "Enter your last name", autoComplete: "family-name" })}
      </div>
      <div className={styles.row}>
        {field("email", "Email Address", { type: "email", placeholder: "you@example.com", autoComplete: "email" })}
        {field("phone", "Phone Number", { type: "tel", inputMode: "tel", placeholder: "+1 234 567 8900", autoComplete: "tel" })}
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Message <span aria-hidden="true">*</span></label>
        <textarea
          id="message" name="message" rows={5} value={values.message} onChange={set("message")} required
          placeholder="How can we help you?"
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
        />
        {errors.message && <small id="message-error" className={styles.fieldError}>{errors.message}</small>}
      </div>

      {/* spam trap: hidden from people, bots fill it in */}
      <div className={styles.trap} aria-hidden="true">
        <label>Company<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
      </div>

      {status === "error" && (
        <p className={styles.formAlert} role="alert">
          Something went wrong while sending. Please try again in a moment.
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={status === "sending"}>
        {status === "sending" ? <span className={styles.spinner} aria-hidden="true" /> : <Glyph name="send" size={18} />}
        {status === "sending" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}