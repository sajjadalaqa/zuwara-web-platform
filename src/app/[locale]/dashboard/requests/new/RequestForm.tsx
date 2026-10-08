"use client";

import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { createRequestAction } from "../actions";
import { categoryIcon } from "../categories";
import type { Copy } from "../copy";
import { CATEGORIES, initialFormState, type FieldName } from "../types";
import { LIMITS } from "../validation";
import s from "../requests.module.css";

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

export default function RequestForm({
  t, locale, minDate, backHref,
}: {
  t: Copy;
  locale: string;
  minDate: string;
  backHref: string;
}) {
  const [state, action, pending] = useActionState(createRequestAction, initialFormState);

  // Controlled fields, so nothing is lost when the server returns errors.
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("");

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

      <Field htmlFor="title" label={f.titleLabel} error={err("title")}>
        <input
          id="title" name="title" className={s.input}
          value={title} onChange={(e) => setTitle(e.target.value)}
          maxLength={LIMITS.titleMax} placeholder={f.titlePlaceholder}
          aria-invalid={!!err("title")}
        />
      </Field>

      <Field htmlFor="description" label={f.description} error={err("description")}>
        <div className={s.counterWrap}>
          <textarea
            id="description" name="description" className={`${s.input} ${s.textarea}`}
            value={description} onChange={(e) => setDescription(e.target.value)}
            maxLength={LIMITS.descMax} rows={5} placeholder={f.descriptionPlaceholder}
            aria-invalid={!!err("description")}
          />
          <span className={s.counter}>{description.length}/{LIMITS.descMax}</span>
        </div>
      </Field>

      <div className={s.row2}>
        <Field htmlFor="city" label={f.city} error={err("city")}>
          <input
            id="city" name="city" className={s.input} autoComplete="address-level2"
            value={city} onChange={(e) => setCity(e.target.value)}
            maxLength={LIMITS.cityMax} aria-invalid={!!err("city")}
          />
        </Field>

        <Field htmlFor="preferredDate" label={f.date} error={err("preferredDate")}>
          <input
            id="preferredDate" name="preferredDate" type="date" className={s.input}
            value={date} onChange={(e) => setDate(e.target.value)}
            min={minDate} aria-invalid={!!err("preferredDate")}
          />
        </Field>

        <Field htmlFor="budget" label={f.budget} optional={f.optional} error={err("budget")} hint={f.budgetHint}>
          <div className={s.suffixBox}>
            <input
              id="budget" name="budget" className={s.input} dir="ltr"
              inputMode="numeric" placeholder="0"
              value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-invalid={!!err("budget")}
            />
            <span className={s.suffix}>{f.currency}</span>
          </div>
        </Field>
      </div>

      <div className={s.formActions}>
        <Link href={backHref} className={`${s.btn} ${s.btnGhost} ${s.btnLg}`}>{f.cancel}</Link>
        <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} disabled={pending}>
          {pending ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}