"use client";
import { Link, useRouter } from "@/i18n/navigation";
import { otpStatusAction, resendOtpAction, verifyOtpAction } from "@/lib/auth/actions";
import { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import { SubmitButton } from "@/components/auth/Field";
import { Icon } from "@/components/auth/icons";
import s from "@/components/auth/auth.module.css";

const LEN = 6;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(LEN).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);
  useEffect(() => { otpStatusAction().then(result => {
    if (result.ok) setSeconds(Math.max(0, Math.ceil(((result.resendAt ?? 0) - Date.now()) / 1000)));
    else { setError(result.error); setSeconds(0); }
  }).catch(() => setError("Unable to load verification status.")); }, []);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setAt = (i: number, v: string) => {
    const d = [...digits]; d[i] = v; setDigits(d);
  };
  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };
  const onPaste = (e: ClipboardEvent) => {
    const t = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LEN);
    if (!t) return;
    e.preventDefault();
    setDigits(Array.from({ length: LEN }, (_, i) => t[i] ?? ""));
    refs.current[Math.min(t.length, LEN - 1)]?.focus();
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (digits.join("").length < LEN) return setError("Enter the 6-digit code.");
    setError(""); setLoading(true);
    try {
      const result = await verifyOtpAction(digits.join(""));
      if (result.ok) { router.replace("/dashboard"); router.refresh(); }
      else setError(result.error);
    } catch { setError("Unable to connect. Please try again."); }
    finally { setLoading(false); }
  }

  async function resend() {
    if (resending || loading) return;
    setResending(true); setError("");
    try {
      const result = await resendOtpAction();
      if (result.ok) {
        setSeconds(Math.max(0, Math.ceil(((result.resendAt ?? 0) - Date.now()) / 1000)));
        setDigits(Array(LEN).fill("")); refs.current[0]?.focus();
      } else setError(result.error);
    } catch { setError("Unable to resend. Please try again."); }
    finally { setResending(false); }
  }

  return (
    <AuthLayout headline="Check your phone." tagline="We sent a 6-digit verification code to your phone. It expires in two minutes.">
      <span className={s.badge}><Icon name="shield" size={26} /></span>
      <div className={s.cardHead}>
        <div>
          <h2>Verify Your Code</h2>
          <p>Enter the 6-digit code we sent to your phone.</p>
        </div>
      </div>
      <form className={s.form} onSubmit={onSubmit} noValidate>
        <div className={s.otp} onPaste={onPaste}>
          {digits.map((d, i) => (
            <input key={i} ref={(el) => { refs.current[i] = el; }} className={`${s.otpBox} ${error ? s.invalid : ""}`}
              inputMode="numeric" autoComplete={i === 0 ? "one-time-code" : "off"} maxLength={1} value={d}
              aria-label={`Digit ${i + 1}`}
              onChange={(e) => { const v = e.target.value.replace(/\D/g, ""); setAt(i, v); if (v && i < LEN - 1) refs.current[i + 1]?.focus(); }}
              onKeyDown={(e) => onKey(i, e)} />
          ))}
        </div>
        {error && <p className={s.error} role="alert"><Icon name="alert" size={14} />{error}</p>}
        <SubmitButton loading={loading}>Verify Code</SubmitButton>
      </form>
      <div className={s.foot}>
        {seconds > 0
          ? <span>Resend code in <b>0:{String(seconds).padStart(2, "0")}</b></span>
          : <span>Didn&apos;t get it? <button type="button" onClick={resend} disabled={resending || loading} className={s.link} style={{ background: "none", border: 0, cursor: "pointer", font: "inherit", fontWeight: 600 }}>Resend code</button></span>}
        <Link href="/login-page" className={s.backLink}><Icon name="arrowLeft" size={14} /><span>Back to Sign In</span></Link>
      </div>
    </AuthLayout>
  );
}