"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { Link } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import s from "@/components/auth/auth.module.css";

export default function ResetPasswordPage() {
  const uiText = useUiText();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (password.length < 8) err.password = uiText("Use at least 8 characters.");
    if (confirm !== password || !confirm) err.confirm = uiText("Passwords do not match.");
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    // TODO: call reset password API here -> { password }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  }

  return (
    <AuthLayout headline={uiText("Choose a new password.")} tagline={uiText("Pick something strong that you don't use anywhere else.")}>
      {done ? (
        <div className={s.success}>
          <span className={s.successIcon}><Icon name="check" size={36} /></span>
          <div className={s.cardHead} style={{ display: "block", marginBottom: 24 }}>
            <h2>{uiText("Password Updated")}</h2>
            <p>{uiText("Your password has been changed. You can now sign in with your new password.")}</p>
          </div>
          <Link href="/login-page" className={s.btn} style={{ textDecoration: "none" }}>{uiText("Back to Sign In")}</Link>
        </div>
      ) : (
        <>
          <span className={s.badge}><Icon name="lock" size={26} /></span>
          <div className={s.cardHead}>
            <div>
              <h2>{uiText("Reset Password")}</h2>
              <p>{uiText("Create a new password for your Zuwara account.")}</p>
            </div>
          </div>
          <form className={s.form} onSubmit={onSubmit} noValidate>
            <Field label={uiText("New Password")} icon="lock" type="password" required placeholder="e.g. #123@456"
              autoComplete="new-password" showStrength value={password} onChange={setPassword} error={errors.password} />
            <Field label={uiText("Confirm Password")} icon="lock" type="password" required placeholder="e.g. #123@456"
              autoComplete="new-password" value={confirm} onChange={setConfirm} error={errors.confirm} />
            <SubmitButton loading={loading}>{uiText("Update Password")}</SubmitButton>
          </form>
          <div className={s.foot}>
            <Link href="/login-page" className={s.link}><Icon name="arrowLeft" size={14} /> {uiText("Back to Sign In")}</Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
