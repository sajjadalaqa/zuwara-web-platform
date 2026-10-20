"use client";
import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import { refreshBrowserSession } from "@/lib/auth/browser-refresh";
import s from "@/components/auth/auth.module.css";
export default function SessionRefreshPage() {
  const router = useRouter();
  const started = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    refreshBrowserSession().then(result => {
      if (result.ok) { router.replace("/dashboard"); router.refresh(); }
      else setError(result.error);
    }).catch(() => setError("Unable to renew your session. Please sign in again."));
  }, [router]);
  return <AuthLayout><div className={s.cardHead}><div><h2>Renewing your session</h2><p>Please wait a moment.</p></div></div>
    {error && <><p className={s.error} role="alert">{error}</p><Link href="/login-page" className={s.link}>Back to Sign In</Link></>}
  </AuthLayout>;
}