"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageScrollReset() {
  const pathname = usePathname();
  const historyDestination = useRef<string | null>(null);

  useEffect(() => {
    const onPopState = () => {
      historyDestination.current = window.location.pathname;
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    // Let the browser restore Back/Forward positions and follow anchor links.
    if (historyDestination.current === pathname) {
      historyDestination.current = null;
      return;
    }
    historyDestination.current = null;
    if (window.location.hash) return;

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}