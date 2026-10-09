"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { createComplaintAction } from "../actions";
import { categoryIcon } from "../categories";
import type { Copy } from "../copy";
import { CATEGORIES, initialFormState, type FieldName } from "../types";
import { LIMITS } from "../validation";
import s from "../complaints.module.css";

function Field({
  htmlFor, label, optional, error, hint, children,
}: {
  htmlFor?: string;
  label: string;
  optional?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className={s.field}>
      {htmlFor ? (
        <label htmlFor={htmlFor} className={s.label}>
          {label}
          {optional && <em>{optional}</em>}
        </label>
      ) : (
        <span className={s.label}>{label}</span>
      )}
      {children}
      {error ? (
        <p className={s.error} role="alert">{error}</p>
      ) : hint ? (
        <p className={s.hint}>{hint}</p>
      ) : null}
    </div>
  );
}

export default function ComplaintForm({
  t, locale, backHref,
}: {
  t: Copy;
  locale: string;
  backHref: string;
}) {
  const [state, action, pending] = useActionState(createComplaintAction, initialFormState);

  // Controlled fields, so nothing is lost when the server returns errors.
  const [category, setCategory] = useState("");
  const [relatedRef, setRelatedRef] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const err = (key: FieldName | "_form") => {
    const code = state.errors?.[key];
    return code ? t.errors[code] : undefined;
  };
  const f = t.form;

  return (
    <form action={action} className={s.formCard} noValidate>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="category" value={category} />

      {err("_form") && <p className={s.banner} role="alert">{err("_form")}</p>}

      <Field label={f.category} error={err("category")}>
        <div className={s.cats} role="radiogroup" aria-label={f.category}>
          {CATEGORIES.map((c) => {
            const Icon = categoryIcon[c];
            return (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={category === c}
                className={`${s.cat} ${category === c ? s.catOn : ""}`}
                onClick={() => setCategory(c)}
              >
                <Icon size={19} />
                <span>{t.categories[c]}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <div className={s.row2}>
        <Field htmlFor="subject" label={f.subject} error={err("subject")}>
          <input
            id="subject" name="subject" className={s.input}
            value={subject} onChange={(e) => setSubject(e.target.value)}
            maxLength={LIMITS.subjectMax} placeholder={f.subjectPlaceholder}
            aria-invalid={!!err("subject")}
          />
        </Field>

        <Field
          htmlFor="relatedRef" label={f.reference} optional={f.optional}
          error={err("relatedRef")} hint={f.referenceHint}
        >
          <input
            id="relatedRef" name="relatedRef" className={s.input} dir="ltr"
            value={relatedRef} onChange={(e) => setRelatedRef(e.target.value.toUpperCase())}
            maxLength={20} placeholder={f.referencePlaceholder}
            aria-invalid={!!err("relatedRef")}
          />
        </Field>
      </div>

      <Field htmlFor="description" label={f.description} error={err("description")}>
        <div className={s.counterWrap}>
          <textarea
            id="description" name="description" className={`${s.input} ${s.textarea}`}
            value={description} onChange={(e) => setDescription(e.target.value)}
            maxLength={LIMITS.descMax} rows={6} placeholder={f.descriptionPlaceholder}
            aria-invalid={!!err("description")}
          />
          <span className={s.counter}>{description.length}/{LIMITS.descMax}</span>
        </div>
      </Field>

      <div className={s.formActions}>
        <Link href={backHref} className={`${s.btn} ${s.btnGhost} ${s.btnLg}`}>{f.cancel}</Link>
        <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} disabled={pending}>
          {pending ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}