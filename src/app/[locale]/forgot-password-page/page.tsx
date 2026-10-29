"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import { isEmail } from "@/components/auth/validators";
import s from "@/components/auth/auth.module.css";

export default function ForgotPasswordPage() {
  const uiText = useUiText();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) return setError(uiText("Enter the email you registered with."));
    setError("");
    setLoading(true);
    // TODO: call "send reset code" API here -> { email }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    router.push("/verify-otp-page");
  }

  return (
    <AuthLayout headline={uiText("Locked out? We'll get you back in.")} tagline={uiText("Enter your email and we will send you a 6-digit code to reset your password.")}>
      <span className={s.badge}><Icon name="key" size={26} /></span>
      <div className={s.cardHead}>
        <div>
          <h2>{uiText("Forgot Password?")}</h2>
          <p>{uiText("No worries. Enter your email address and we'll send you a verification code.")}</p>
        </div>
      </div>
      <form className={s.form} onSubmit={onSubmit} noValidate>
        <Field label={uiText("Email Address")} icon="mail" type="email" required placeholder={uiText("e.g. david@gmail.com")}
          autoComplete="email" value={email} onChange={setEmail} error={uiText(error)} />
        <SubmitButton loading={loading}>{uiText("Send Code")}</SubmitButton>
      </form>
      <div className={s.foot}>
        <Link href="/login-page" className={s.link}><Icon name="arrowLeft" size={14} /> {uiText("Back to Sign In")}</Link>
      </div>
    </AuthLayout>
  );
}
