"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, PhoneField, SubmitButton } from "@/components/auth/Field";
import { isEmail } from "@/components/auth/validators";
import s from "@/components/auth/auth.module.css";

const initial = { firstName: "", lastName: "", userName: "", email: "", password: "", confirm: "", dial: "+966", phone: "", referral: "" };

export default function RegisterPage() {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof initial) => (v: string) => setF((p) => ({ ...p, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.firstName.trim()) err.firstName = "First name is required.";
    if (!f.lastName.trim()) err.lastName = "Last name is required.";
    if (f.userName.trim().length < 3) err.userName = "Username must be at least 3 characters.";
    if (!isEmail(f.email)) err.email = "Enter a valid email address.";
    if (f.password.length < 8) err.password = "Use at least 8 characters.";
    if (f.confirm !== f.password || !f.confirm) err.confirm = "Passwords do not match.";
    if (f.phone.replace(/\s/g, "").length < 6) err.phone = "Enter a valid contact number.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    // TODO: call register API here -> f (contact = f.dial + f.phone)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
  }

  return (
    <AuthLayout wide headline="Join Zuwara and book trusted care in minutes."
      tagline="Create your account to book consultations and home services from verified Saudi medical teams.">
      <div className={s.cardHead}>
        <div>
          <h2>Sign Up</h2>
          <p>Create your account. It only takes a minute.</p>
        </div>
      </div>

      <form className={s.form} onSubmit={onSubmit} noValidate>
        <div className={s.row}>
          <Field label="First Name" icon="user" required placeholder="e.g. David" autoComplete="given-name"
            value={f.firstName} onChange={set("firstName")} error={errors.firstName} />
          <Field label="Last Name" icon="user" required placeholder="e.g. Finley" autoComplete="family-name"
            value={f.lastName} onChange={set("lastName")} error={errors.lastName} />
        </div>
        <Field label="User Name" icon="at" required placeholder="e.g. DavidFinley" autoComplete="username"
          value={f.userName} onChange={set("userName")} error={errors.userName} />
        <Field label="Email Address" icon="mail" type="email" required placeholder="e.g. david@gmail.com"
          autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
        <div className={s.row}>
          <Field label="Your Password" icon="lock" type="password" required placeholder="e.g. #123@456"
            autoComplete="new-password" showStrength value={f.password} onChange={set("password")} error={errors.password} />
          <Field label="Confirm Password" icon="lock" type="password" required placeholder="e.g. #123@456"
            autoComplete="new-password" value={f.confirm} onChange={set("confirm")} error={errors.confirm} />
        </div>
        <PhoneField label="Contact Number" dial={f.dial} number={f.phone} error={errors.phone}
          onDial={set("dial")} onNumber={set("phone")} />
        <Field label="Do you have a referral code?" optional icon="gift" placeholder="Referral Code"
          value={f.referral} onChange={set("referral")} />

        <SubmitButton loading={loading}>Register</SubmitButton>
      </form>

      <div className={s.foot}>
        <span>Already Have Account? <Link href="/login-page" className={s.link}>Sign In</Link></span>
      </div>
    </AuthLayout>
  );
}