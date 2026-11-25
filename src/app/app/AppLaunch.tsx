"use client";

import { useEffect, useRef } from "react";

export default function AppLaunch({ launchUrl, openUrl, label }: { launchUrl: string; openUrl: string; label: string }) {
  const attemptedUrl = useRef<string | null>(null);

  useEffect(() => {
    function attemptLaunch() {
      if (attemptedUrl.current === launchUrl || document.visibilityState !== "visible") return;
      attemptedUrl.current = launchUrl;
      window.location.assign(launchUrl);
    }

    document.addEventListener("visibilitychange", attemptLaunch);
    attemptLaunch();
    return () => document.removeEventListener("visibilitychange", attemptLaunch);
  }, [launchUrl]);

  return (
    <a className="button button-primary" href={openUrl}>
      {label}
    </a>
  );
}
