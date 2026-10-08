"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Pencil, PenLine, Star } from "lucide-react";
import { saveReviewAction } from "./actions";
import type { Copy } from "./copy";
import { initialFormState } from "./types";
import { MAX_COMMENT } from "./validation";
import s from "./reviews.module.css";

type Props = {
  mode: "create" | "edit";
  appointmentId: string;
  reviewId?: string;
  providerName: string;
  initialRating?: number;
  initialComment?: string;
  t: Copy;
};

function ReviewDialog({
  mode, appointmentId, reviewId, providerName,
  initialRating = 0, initialComment = "", t, onClose,
}: Props & { onClose: () => void }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(saveReviewAction, initialFormState);
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const shown = hover || rating;
  const isEdit = mode === "edit";

  const ratingError = state.errors?.rating;
  const commentError = state.errors?.comment;
  const formError = state.errors?._form;

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
  }, [state.ok, onClose, router]);

  return (
    <div className={s.overlay} onClick={() => !pending && onClose()}>
      <form
        action={action}
        className={s.dialog}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <input type="hidden" name="appointmentId" value={appointmentId} />
        {reviewId && <input type="hidden" name="reviewId" value={reviewId} />}
        <input type="hidden" name="rating" value={rating || ""} />

        <h4>{isEdit ? t.dialog.titleEdit : t.dialog.titleNew}</h4>
        <p>{t.dialog.how.replace("{name}", providerName)}</p>

        <div
          className={s.picker}
          role="radiogroup"
          aria-label={t.dialog.rating}
          dir="ltr"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={t.starsLabel.replace("{n}", String(n))}
              className={`${s.pick} ${n <= shown ? s.pickOn : ""}`}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              <Star size={34} fill={n <= shown ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
        <p className={s.ratingWord}>{shown ? t.ratingLabels[shown - 1] : "\u00A0"}</p>
        {ratingError && <p className={s.dialogError} role="alert">{t.errors[ratingError]}</p>}

        <div className={s.commentBox}>
          <label htmlFor="comment">{t.dialog.comment}</label>
          <textarea
            id="comment"
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={MAX_COMMENT}
            rows={4}
            placeholder={t.dialog.placeholder}
            aria-invalid={!!commentError}
          />
          <span className={s.counter}>{comment.length}/{MAX_COMMENT}</span>
        </div>
        {commentError && <p className={s.dialogError} role="alert">{t.errors[commentError]}</p>}
        {formError && <p className={s.dialogError} role="alert">{t.errors[formError]}</p>}

        <div className={s.dialogBtns}>
          <button type="button" className={s.dialogKeep} onClick={onClose} disabled={pending}>
            {t.dialog.cancel}
          </button>
          <button type="submit" className={s.dialogConfirm} disabled={pending}>
            {pending ? t.dialog.saving : isEdit ? t.dialog.save : t.dialog.submit}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ReviewButton(props: Props) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const isEdit = props.mode === "edit";

  return (
    <>
      <button
        type="button"
        className={`${s.btn} ${isEdit ? s.btnGhost : s.btnPrimary}`}
        onClick={() => setOpen(true)}
      >
        {isEdit ? <Pencil size={14} /> : <PenLine size={14} />}
        {isEdit ? props.t.edit : props.t.write}
      </button>
      {open && createPortal(<ReviewDialog {...props} onClose={close} />, document.body)}
    </>
  );
}