"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Plus, Wallet } from "lucide-react";
import { topUpAction } from "./actions";
import type { Copy } from "./copy";
import { initialTopUpState } from "./types";
import { PRESETS } from "./validation";
import s from "./wallet.module.css";

function TopUpDialog({
  t, locale, onClose,
}: {
  t: Copy;
  locale: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(topUpAction, initialTopUpState);
  const [amount, setAmount] = useState("");
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  // success: go to the payment gateway if the backend gave a link, else just close
  useEffect(() => {
    if (!state.ok) return;
    if (state.paymentUrl) {
      window.location.assign(state.paymentUrl);
    } else {
      onClose();
      router.refresh();
    }
  }, [state, onClose, router]);

  return (
    <div className={s.overlay} onClick={() => !pending && onClose()}>
      <form
        action={action}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <span className={s.dialogIcon}><Wallet size={24} /></span>
        <h4>{t.dialog.title}</h4>
        <p>{t.dialog.text}</p>

        <div className={s.presets}>
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              className={`${s.preset} ${amount === String(p) ? s.presetOn : ""}`}
              onClick={() => setAmount(String(p))}
            >
              {nf.format(p)}
            </button>
          ))}
        </div>

        <div className={s.amountBox}>
          <input
            name="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, "").slice(0, 5))}
            inputMode="numeric"
            dir="ltr"
            autoFocus
            placeholder="0"
            aria-label={t.dialog.amount}
            aria-invalid={!!state.error}
          />
          <span>{t.dialog.currency}</span>
        </div>

        {state.error && <p className={s.dialogError} role="alert">{t.errors[state.error]}</p>}
        <p className={s.dialogNote}>{t.dialog.note}</p>

        <div className={s.dialogBtns}>
          <button type="button" className={s.dialogKeep} onClick={onClose} disabled={pending}>
            {t.dialog.cancel}
          </button>
          <button type="submit" className={s.dialogConfirm} disabled={pending}>
            {pending ? t.dialog.working : t.dialog.confirm}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function TopUpButton({
  t, locale, label,
}: {
  t: Copy;
  locale: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button type="button" className={s.addBtn} onClick={() => setOpen(true)}>
        <Plus size={17} />
        {label ?? t.addFunds}
      </button>
      {open &&
        createPortal(<TopUpDialog t={t} locale={locale} onClose={close} />, document.body)}
    </>
  );
}