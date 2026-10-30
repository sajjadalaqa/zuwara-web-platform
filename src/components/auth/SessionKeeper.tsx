"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { refreshBrowserSession } from "@/lib/auth/browser-refresh";
export default function SessionKeeper() {
  const router = useRouter();
  const pending = useRef(false);
  useEffect(() => {
    const renew = async () => {
      if (pending.current || document.visibilityState !== "visible") return;
      pending.current = true;
      try {
        const result = await refreshBrowserSession();
        if (!result.ok) {
          router.replace("/login-page?reason=session-expired");
          router.refresh();
        }
      } catch { /* Retry on the next timer or visibility change after a connection failure. */ }
      finally { pending.current = false; }
    };
    const timer = setInterval(() => { void renew().catch(() => {}); }, 45_000);
    document.addEventListener("visibilitychange", renew);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", renew); };
  }, [router]);
  return null;
}