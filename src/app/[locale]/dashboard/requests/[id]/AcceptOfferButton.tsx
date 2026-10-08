"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { acceptOfferAction } from "../actions";
import s from "./detail.module.css";

type Props = {
  requestId: string;
  offerId: string;
  providerName: string;
  price: string; // already formatted, e.g. "SAR 180"
  labels: {
    accept: string;
    title: string;
    text: string; // contains {name} and {price}
    confirm: string;
    keep: string;
    working: string;
  };
  errors: Record<string, string>;
};

export default function AcceptOfferButton({
  requestId, offerId, providerName, price, labels, errors,
}: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, start] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, busy]);

  const confirm = () => {
    setError("");
    start(async () => {
      try {
        const res = await acceptOfferAction(requestId, offerId);
        if (res.ok) {
          setOpen(false);
          router.refresh();
        } else {
          setError(errors[res.error] ?? errors.generic);
        }
      } catch {
        setError(errors.generic);
      }
    });
  };

  return (
    <>
      <button type="button" className={s.acceptBtn} onClick={() => setOpen(true)}>
        {labels.accept}
      </button>

      {open &&
        createPortal(
          <div className={s.overlay} onClick={() => !busy && setOpen(false)}>
            <div
              className={s.dialog}
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <span className={s.dialogIcon}><CheckCircle2 size={26} /></span>
              <h4>{labels.title}</h4>
              <p>{labels.text.replace("{name}", providerName).replace("{price}", price)}</p>
              {error && <p className={s.dialogError} role="alert">{error}</p>}
              <div className={s.dialogBtns}>
                <button type="button" className={s.dialogKeep} onClick={() => setOpen(false)} disabled={busy}>
                  {labels.keep}
                </button>
                <button type="button" className={s.dialogConfirm} onClick={confirm} disabled={busy}>
                  {busy ? labels.working : labels.confirm}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}