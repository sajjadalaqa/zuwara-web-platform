"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { cancelAppointmentAction } from "./actions";
import s from "./appointments.module.css";

type Props = {
  id: string;
  labels: {
    cancel: string;
    title: string;
    text: string;
    confirm: string;
    keep: string;
    working: string;
  };
  errors: Record<string, string>;
};

export default function CancelButton({ id, labels, errors }: Props) {
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
        const res = await cancelAppointmentAction(id);
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
      <button type="button" className={`${s.btn} ${s.btnDanger}`} onClick={() => setOpen(true)}>
        {labels.cancel}
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
              <span className={s.dialogIcon}><AlertTriangle size={24} /></span>
              <h4>{labels.title}</h4>
              <p>{labels.text}</p>
              {error && <p className={s.dialogError}>{error}</p>}
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