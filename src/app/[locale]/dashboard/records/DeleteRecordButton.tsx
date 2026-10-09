"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteRecordAction } from "./actions";
import type { Copy } from "./copy";
import s from "./records.module.css";

export default function DeleteRecordButton({ id, t }: { id: string; t: Copy }) {
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
        const res = await deleteRecordAction(id);
        if (res.ok) {
          setOpen(false);
          router.refresh();
        } else {
          setError(t.errors[res.error]);
        }
      } catch {
        setError(t.errors.generic);
      }
    });
  };

  return (
    <>
      <button
        type="button"
        className={s.iconBtn}
        onClick={() => setOpen(true)}
        aria-label={t.delete}
        title={t.delete}
      >
        <Trash2 size={16} />
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
              <h4>{t.dialog.title}</h4>
              <p>{t.dialog.text}</p>
              {error && <p className={s.dialogError} role="alert">{error}</p>}
              <div className={s.dialogBtns}>
                <button type="button" className={s.dialogKeep} onClick={() => setOpen(false)} disabled={busy}>
                  {t.dialog.keep}
                </button>
                <button type="button" className={s.dialogConfirm} onClick={confirm} disabled={busy}>
                  {busy ? t.dialog.working : t.dialog.confirm}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}