"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import { isEmail } from "@/components/auth/validators";
import s from "@/components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return setError("Enter the email you registered with.");
    setError("");
    setLoading(true);
    // TODO: call "send reset code" API here -> { email }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    router.push("/verify-otp-page");
  }

  return (
    <AuthLayout headline="Locked out? We'll get you back in." tagline="Enter your email and we will send you a 6-digit code to reset your password.">
      <span className={s.badge}><Icon name="key" size={26} /></span>
      <div className={s.cardHead}>
        <div>
          <h2>Forgot Password?</h2>
          <p>No worries. Enter your email address and we&apos;ll send you a verification code.</p>
        </div>
      </div>
      <form className={s.form} onSubmit={onSubmit} noValidate>
        <Field label="Email Address" icon="mail" type="email" required placeholder="e.g. david@gmail.com"
          autoComplete="email" value={email} onChange={setEmail} error={error} />
        <SubmitButton loading={loading}>Send Code</SubmitButton>
      </form>
      <div className={s.foot}>
        <Link href="/login-page" className={s.link}><Icon name="arrowLeft" size={14} /> Back to Sign In</Link>
      </div>
    </AuthLayout>
  );
}