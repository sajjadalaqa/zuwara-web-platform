"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, PhoneField, SubmitButton } from "@/components/auth/Field";
import { isEmail } from "@/components/auth/validators";
import { requestOtpAction } from "@/lib/auth/actions";
import s from "@/components/auth/auth.module.css";
const initial = { firstName: "", lastName: "", email: "", dial: "+966", phone: "", referral: "" };
export default function RegisterPage() {
  const uiText = useUiText();
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof initial) => (v: string) => setF(p => ({ ...p, [k]: v }));
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    const err: Record<string, string> = {};
    if (!f.firstName.trim()) err.firstName = uiText("First name is required.");
    if (!f.lastName.trim()) err.lastName = uiText("Last name is required.");
    if (!isEmail(f.email)) err.email = uiText("Enter a valid email address.");
    const phone = f.phone.replace(/[\s-]/g, "");
    if (!/^\d{6,15}$/.test(phone)) err.phone = uiText("Enter a valid phone number.");
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    try {
      const result = await requestOtpAction({ intent: "register", country_code: f.dial, phone_number: phone,
        full_name: `${f.firstName.trim()} ${f.lastName.trim()}`, email: f.email.trim(), referral_code: f.referral.trim() || undefined });
      if (result.ok) router.push("/verify-otp-page"); else setErrors({ form: result.error });
    } catch { setErrors({ form: uiText("Unable to connect. Please try again.") }); }
    finally { setLoading(false); }
  }
  return <AuthLayout wide headline={uiText("Join Zuwara and book trusted care in minutes.")} tagline={uiText("Create your account to book consultations with trusted medical teams.")}>
    <div className={s.cardHead}><div><h2>{uiText("Sign Up")}</h2><p>{uiText("Create your account. It only takes a minute.")}</p></div></div>
    <form className={s.form} onSubmit={onSubmit} noValidate>
      <div className={s.row}>
        <Field label={uiText("First Name")} icon="user" required placeholder={uiText("e.g. David")} autoComplete="given-name" value={f.firstName} onChange={set("firstName")} error={errors.firstName} />
        <Field label={uiText("Last Name")} icon="user" required placeholder={uiText("e.g. Finley")} autoComplete="family-name" value={f.lastName} onChange={set("lastName")} error={errors.lastName} />
      </div>
      <Field label={uiText("Email Address")} icon="mail" type="email" required placeholder={uiText("e.g. david@gmail.com")} autoComplete="email" value={f.email} onChange={set("email")} error={errors.email} />
      <PhoneField label={uiText("Contact Number")} dial={f.dial} number={f.phone} error={errors.phone} onDial={set("dial")} onNumber={set("phone")} />
      <Field label={uiText("Do you have a referral code?")} optional icon="gift" placeholder={uiText("Referral Code")} value={f.referral} onChange={set("referral")} />
      {errors.form && <p className={s.error} role="alert">{uiText(errors.form)}</p>}
      <SubmitButton loading={loading}>{uiText("Register")}</SubmitButton>
    </form>
    <div className={s.foot}><span>{uiText("Already Have Account?")}{" "}<Link href="/login-page" className={s.link}>{uiText("Sign In")}</Link></span></div>
  </AuthLayout>;
}