"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { Field, SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import s from "@/components/auth/auth.module.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (password.length < 8) err.password = "Use at least 8 characters.";
    if (confirm !== password || !confirm) err.confirm = "Passwords do not match.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setLoading(true);
    // TODO: call reset password API here -> { password }
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setDone(true);
  }

  return (
    <AuthLayout headline="Choose a new password." tagline="Pick something strong that you don't use anywhere else.">
      {done ? (
        <div className={s.success}>
          <span className={s.successIcon}><Icon name="check" size={36} /></span>
          <div className={s.cardHead} style={{ display: "block", marginBottom: 24 }}>
            <h2>Password Updated</h2>
            <p>Your password has been changed. You can now sign in with your new password.</p>
          </div>
          <Link href="/login-page" className={s.btn} style={{ textDecoration: "none" }}>Back to Sign In</Link>
        </div>
      ) : (
        <>
          <span className={s.badge}><Icon name="lock" size={26} /></span>
          <div className={s.cardHead}>
            <div>
              <h2>Reset Password</h2>
              <p>Create a new password for your Zuwara account.</p>
            </div>
          </div>
          <form className={s.form} onSubmit={onSubmit} noValidate>
            <Field label="New Password" icon="lock" type="password" required placeholder="e.g. #123@456"
              autoComplete="new-password" showStrength value={password} onChange={setPassword} error={errors.password} />
            <Field label="Confirm Password" icon="lock" type="password" required placeholder="e.g. #123@456"
              autoComplete="new-password" value={confirm} onChange={setConfirm} error={errors.confirm} />
            <SubmitButton loading={loading}>Update Password</SubmitButton>
          </form>
          <div className={s.foot}>
            <Link href="/login-page" className={s.link}><Icon name="arrowLeft" size={14} /> Back to Sign In</Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}