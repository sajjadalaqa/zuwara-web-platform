"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccountAction } from "./actions";
import type { Copy } from "./copy";
import { initialFormState } from "./types";
import s from "./profile.module.css";

function DeleteDialog({ t, locale, onClose }: { t: Copy; locale: string; onClose: () => void }) {
  const [state, action, pending] = useActionState(deleteAccountAction, initialFormState);
  const code = state.errors?.password ?? state.errors?._form;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  return (
    <div className={s.overlay} onClick={() => !pending && onClose()}>
      <form
        action={action}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <input type="hidden" name="locale" value={locale} />
        <span className={s.dialogIcon}><AlertTriangle size={24} /></span>
        <h4>{t.danger.dialogTitle}</h4>
        <p>{t.danger.dialogText}</p>

        <input
          type="password" name="password" dir="ltr" autoFocus
          className={s.dialogInput} placeholder={t.danger.password}
          aria-label={t.danger.password} autoComplete="current-password"
        />
        {code && <p className={s.dialogError} role="alert">{t.errors[code]}</p>}

        <div className={s.dialogBtns}>
          <button type="button" className={s.dialogKeep} onClick={onClose} disabled={pending}>
            {t.danger.cancel}
          </button>
          <button type="submit" className={s.dialogConfirm} disabled={pending}>
            {pending ? t.danger.working : t.danger.confirm}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DeleteAccount({ t, locale }: { t: Copy; locale: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={s.cardHead}>
        <span className={`${s.cardIcon} ${s.cardIconDanger}`}><Trash2 size={19} /></span>
        <div>
          <h2>{t.danger.title}</h2>
          <p>{t.danger.text}</p>
        </div>
      </div>
      <button type="button" className={s.dangerBtn} onClick={() => setOpen(true)}>
        {t.danger.button}
      </button>

      {open &&
        createPortal(
          <DeleteDialog t={t} locale={locale} onClose={() => setOpen(false)} />,
          document.body
        )}
    </>
  );
}