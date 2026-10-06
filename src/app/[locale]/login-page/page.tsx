"use client";
import { Link } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import { isEmail } from "@/components/auth/validators";
import s from "@/components/auth/auth.module.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!isEmail(email)) err.email = "Enter a valid email address.";
    if (!password) err.password = "Enter your password.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    // TODO: call login API here -> { email, password, remember }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
  }

  return (
    <AuthLayout>
      <div className={s.cardHead}>
        <div>
          <h2>Sign In</h2>
          <p><strong>Welcome back.</strong> Sign in to manage your bookings and care.</p>
        </div>
        <Link href="/admin-login" className={s.pill}><Icon name="user" size={15} /> Admin Portal</Link>
      </div>

      <form className={s.form} onSubmit={onSubmit} noValidate>
        <Field label="Email Address" icon="mail" type="email" required placeholder="e.g. david@gmail.com"
          autoComplete="email" value={email} onChange={setEmail} error={errors.email} />
        <Field label="Your Password" icon="lock" type="password" required placeholder="e.g. #123@456"
          autoComplete="current-password" value={password} onChange={setPassword} error={errors.password} />

        <div className={s.between}>
          <label className={s.check}>
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember Me
          </label>
          <Link href="/forgot-password-page" className={s.link}>Forgot Password?</Link>
        </div>

        <SubmitButton loading={loading}>Login</SubmitButton>
      </form>

      <div className={s.foot}>
        <span>Don&apos;t Have An Account? <Link href="/register-page" className={s.link}>Sign Up</Link></span>
      </div>
      <Link href="/register-page" className={s.alt}>
        <Icon name="heart" size={16} /> Want To Register As Provider Or Practitioner?
      </Link>
    </AuthLayout>
  );
}