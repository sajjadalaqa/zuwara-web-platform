"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { replyAction } from "../actions";
import type { Copy } from "../copy";
import { initialFormState } from "../types";
import { LIMITS } from "../validation";
import s from "../complaints.module.css";

export default function ReplyForm({ complaintId, t }: { complaintId: string; t: Copy }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(replyAction, initialFormState);
  const [message, setMessage] = useState("");

  // success: clear the box and reload the conversation
  useEffect(() => {
    if (state.ok) {
      setMessage("");
      router.refresh();
    }
  }, [state, router]);

  const messageError = state.errors?.message ? t.errors[state.errors.message] : undefined;
  const formError = state.errors?._form ? t.errors[state.errors._form] : undefined;

  return (
    <form action={action} className={s.replyForm} noValidate>
      <input type="hidden" name="complaintId" value={complaintId} />

      {formError && <p className={s.banner} role="alert">{formError}</p>}

      <div className={s.counterWrap}>
        <textarea
          name="message" className={`${s.input} ${s.textarea}`}
          value={message} onChange={(e) => setMessage(e.target.value)}
          maxLength={LIMITS.replyMax} rows={4} placeholder={t.detail.replyPlaceholder}
          aria-label={t.detail.replyTitle} aria-invalid={!!messageError}
        />
        <span className={s.counter}>{message.length}/{LIMITS.replyMax}</span>
      </div>
      {messageError && <p className={s.error} role="alert">{messageError}</p>}

      <div className={s.formActions}>
        <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} disabled={pending}>
          {pending ? t.detail.sending : t.detail.send}
        </button>
      </div>
    </form>
  );
}