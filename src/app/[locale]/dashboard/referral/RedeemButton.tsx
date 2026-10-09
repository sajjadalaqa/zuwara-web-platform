"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Coins, Gift } from "lucide-react";
import { redeemAction } from "./actions";
import type { Copy } from "./copy";
import { initialRedeemState } from "./types";
import { REDEEM_OPTIONS, pointsToSar } from "./validation";
import s from "./referral.module.css";

function RedeemDialog({
  t, locale, balance, onClose,
}: {
  t: Copy;
  locale: string;
  balance: number;
  onClose: () => void;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(redeemAction, initialRedeemState);
  const [selected, setSelected] = useState("");
  const nf = new Intl.NumberFormat(locale === "ar" ? "ar-SA" : "en-US");
  const sar = (n: number) => (locale === "ar" ? `${nf.format(n)} ر.س` : `SAR ${nf.format(n)}`);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, onClose]);

  useEffect(() => {
    if (state.ok) {
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
        <input type="hidden" name="points" value={selected} />
        <span className={s.dialogIcon}><Gift size={24} /></span>
        <h4>{t.redeem.title}</h4>
        <p>{t.redeem.text}</p>

        <div className={s.options} role="radiogroup" aria-label={t.redeem.title}>
          {REDEEM_OPTIONS.map((p) => {
            const off = p > balance;
            return (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={selected === String(p)}
                disabled={off}
                className={`${s.option} ${selected === String(p) ? s.optionOn : ""}`}
                onClick={() => setSelected(String(p))}
              >
                <b>{nf.format(p)} {t.hero.points}</b>
                <small>{t.redeem.option.replace("{credit}", sar(pointsToSar(p)))}</small>
              </button>
            );
          })}
        </div>

        {state.error && <p className={s.dialogError} role="alert">{t.errors[state.error]}</p>}

        <div className={s.dialogBtns}>
          <button type="button" className={s.dialogKeep} onClick={onClose} disabled={pending}>
            {t.redeem.cancel}
          </button>
          <button type="submit" className={s.dialogConfirm} disabled={pending}>
            {pending ? t.redeem.working : t.redeem.confirm}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function RedeemButton({
  t, locale, balance,
}: {
  t: Copy;
  locale: string;
  balance: number;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const canRedeem = balance >= REDEEM_OPTIONS[0];

  return (
    <>
      <button
        type="button"
        className={s.redeemBtn}
        onClick={() => setOpen(true)}
        disabled={!canRedeem}
        title={canRedeem ? undefined : t.redeem.notEnough}
      >
        <Coins size={16} />
        {t.redeem.button}
      </button>
      {open &&
        createPortal(
          <RedeemDialog t={t} locale={locale} balance={balance} onClose={close} />,
          document.body
        )}
    </>
  );
}