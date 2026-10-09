"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import s from "./referral.module.css";

export default function CopyField({
  label, value, copyLabel, copiedLabel,
}: {
  label: string;
  value: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Fallback for browsers or contexts without the clipboard API
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* nothing else to try */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={s.copyField}>
      <span className={s.copyLabel}>{label}</span>
      <div className={s.copyBox}>
        <span className={s.copyValue} dir="ltr">{value}</span>
        <button
          type="button"
          className={`${s.copyBtn} ${copied ? s.copyBtnOn : ""}`}
          onClick={onCopy}
          aria-label={`${copyLabel}: ${label}`}
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
          <span aria-live="polite">{copied ? copiedLabel : copyLabel}</span>
        </button>
      </div>
    </div>
  );
}