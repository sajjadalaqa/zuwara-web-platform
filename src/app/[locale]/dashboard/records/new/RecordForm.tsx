"use client";

import Link from "next/link";
import {
  startTransition, useActionState, useRef, useState,
  type DragEvent, type FormEvent, type ReactNode,
} from "react";
import { FileText, Image as ImageIcon, Lock, Upload, X } from "lucide-react";
import { createRecordAction } from "../actions";
import { categoryIcon } from "../categories";
import type { Copy } from "../copy";
import { CATEGORIES, initialFormState, type FieldName } from "../types";
import { ALLOWED_TYPES, LIMITS, MAX_FILE_BYTES, formatSize } from "../validation";
import s from "../records.module.css";

function Field({
  htmlFor, label, optional, error, children,
}: {
  htmlFor?: string;
  label: string;
  optional?: string;
  error?: string;
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
      {error && <p className={s.error} role="alert">{error}</p>}
    </div>
  );
}

export default function RecordForm({
  t, locale, maxDate, backHref,
}: {
  t: Copy;
  locale: string;
  maxDate: string;
  backHref: string;
}) {
  const [state, action, pending] = useActionState(createRecordAction, initialFormState);
  const inputRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [recordDate, setRecordDate] = useState("");
  const [provider, setProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  const err = (key: FieldName | "_form") => {
    const code = state.errors?.[key];
    return code ? t.errors[code] : undefined;
  };
  const f = t.form;

  const pick = (picked: File | null | undefined) => {
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setFileError(t.errors.file_bad_type);
    } else if (picked.size > MAX_FILE_BYTES) {
      setFileError(t.errors.file_too_large);
    } else {
      setFileError("");
      setFile(picked);
      return;
    }
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && inputRef.current) {
      // Keep the real input in sync so the file is sent with the form.
      const dt = new DataTransfer();
      dt.items.add(dropped);
      inputRef.current.files = dt.files;
    }
    pick(dropped);
  };

  // We call the action ourselves (instead of action={...}) so React doesn't
  // reset the form, and the chosen file survives a validation error.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };

  const FileIcon = file?.type.startsWith("image/") ? ImageIcon : FileText;

  return (
    <form onSubmit={onSubmit} className={s.formCard} noValidate>
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
        <Field htmlFor="title" label={f.titleLabel} error={err("title")}>
          <input
            id="title" name="title" className={s.input}
            value={title} onChange={(e) => setTitle(e.target.value)}
            maxLength={LIMITS.titleMax} placeholder={f.titlePlaceholder}
            aria-invalid={!!err("title")}
          />
        </Field>

        <Field htmlFor="recordDate" label={f.date} error={err("recordDate")}>
          <input
            id="recordDate" name="recordDate" type="date" className={s.input}
            value={recordDate} onChange={(e) => setRecordDate(e.target.value)}
            max={maxDate} aria-invalid={!!err("recordDate")}
          />
        </Field>
      </div>

      <Field htmlFor="provider" label={f.provider} optional={f.optional} error={err("provider")}>
        <input
          id="provider" name="provider" className={s.input}
          value={provider} onChange={(e) => setProvider(e.target.value)}
          maxLength={LIMITS.providerMax} placeholder={f.providerPlaceholder}
          aria-invalid={!!err("provider")}
        />
      </Field>

      <Field htmlFor="notes" label={f.notes} optional={f.optional} error={err("notes")}>
        <div className={s.counterWrap}>
          <textarea
            id="notes" name="notes" className={`${s.input} ${s.textarea}`}
            value={notes} onChange={(e) => setNotes(e.target.value)}
            maxLength={LIMITS.notesMax} rows={3} placeholder={f.notesPlaceholder}
            aria-invalid={!!err("notes")}
          />
          <span className={s.counter}>{notes.length}/{LIMITS.notesMax}</span>
        </div>
      </Field>

      <Field label={f.file} error={fileError || err("file")}>
        <label
          htmlFor="file"
          className={`${s.drop} ${dragging ? s.dropOn : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
        >
          <span className={s.dropIcon}><Upload size={22} /></span>
          <b>{f.dropTitle}</b>
          <small>{f.dropHint}</small>
          <input
            ref={inputRef} id="file" name="file" type="file"
            className={s.fileInput}
            accept="application/pdf,image/jpeg,image/png,image/webp"
            onChange={(e) => pick(e.target.files?.[0])}
          />
        </label>

        {file && (
          <div className={s.fileChip}>
            <span className={s.fileIcon}><FileIcon size={18} /></span>
            <span className={s.fileText}>
              <b>{file.name}</b>
              <small>{formatSize(file.size, locale)}</small>
            </span>
            <button type="button" className={s.iconBtn} onClick={clearFile} aria-label={f.remove} title={f.remove}>
              <X size={16} />
            </button>
          </div>
        )}
      </Field>

      <p className={s.privacy}><Lock size={13} />{f.privacy}</p>

      <div className={s.formActions}>
        <Link href={backHref} className={`${s.btn} ${s.btnGhost} ${s.btnLg}`}>{f.cancel}</Link>
        <button type="submit" className={`${s.btn} ${s.btnPrimary} ${s.btnLg}`} disabled={pending}>
          {pending ? f.submitting : f.submit}
        </button>
      </div>
    </form>
  );
}