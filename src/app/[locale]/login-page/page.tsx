"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { PhoneField, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import { requestOtpAction } from "@/lib/auth/actions";
import s from "@/components/auth/auth.module.css";

export default function LoginPage() {
  const uiText = useUiText();
  const router = useRouter();
  const [dial, setDial] = useState("+966");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const number = phone.replace(/[\s-]/g, "");
    if (!/^\d{6,15}$/.test(number)) return setError(uiText("Enter a valid phone number."));
    setLoading(true); setError("");
    try {
      const result = await requestOtpAction({ intent: "login", country_code: dial, phone_number: number });
      if (result.ok) router.push("/verify-otp-page"); else setError(result.error);
    } catch { setError(uiText("Unable to connect. Please try again.")); }
    finally { setLoading(false); }
  }
  return <AuthLayout>
    <div className={s.cardHead}>
      <div><h2>{uiText("Sign In")}</h2><p><strong>{uiText("Welcome back.")}</strong> {uiText("Sign in to manage your bookings and care.")}</p></div>
      
    </div>
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <PhoneField label={uiText("Phone Number")} dial={dial} number={phone} onDial={setDial} onNumber={setPhone} />
      <p>{uiText("We’ll send a 6-digit verification code to your phone.")}</p>
      {error && <p className={s.error} role="alert">{uiText(error)}</p>}
      <SubmitButton loading={loading}>{uiText("Send Verification Code")}</SubmitButton>
    </form>
    <div className={s.foot}><span>{uiText("Don't Have An Account?")}{" "}<Link href="/register-page" className={s.link}>{uiText("Sign Up")}</Link></span></div>
    <Link href="/register-page" className={s.alt}><Icon name="heart" size={16} /> {uiText("Want To Register As Provider Or Practitioner?")}</Link>
  </AuthLayout>;
}