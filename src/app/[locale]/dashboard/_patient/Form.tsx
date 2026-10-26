"use client";
import { useActionState, useRef, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { mutate, type Result } from "./actions";
import s from "../_care/care.module.css";
export default function Form({
  op,
  source = "zuwara",
  id,
  children,
  label,
  uncertain = false,
  uploadLimit,
}: {
  op: string;
  source?: "zuwara" | "d4h";
  id?: string | number;
  children?: ReactNode;
  label: string;
  uncertain?: boolean;
  uploadLimit?: number;
}) {
  const [state, action, pending] = useActionState<Result, FormData>(mutate, {
    ok: false,
  });
  const [localError,setLocalError]=useState("");
  const locked = useRef(false);
  useEffect(() => {
    if (!pending) locked.current = false;
  }, [pending, state]);
  const ar = useLocale() === "ar";
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (locked.current || state.uncertain || (uncertain && state.ok && op !== "avatar")) {
          e.preventDefault();
          return;
        }
        if (
          (op === "document-delete" || op === "address-delete") &&
          !window.confirm(
            op === "document-delete"
              ? "Delete this patient-uploaded document?"
              : "Archive this saved address?",
          )
        ) {
          e.preventDefault();
          return;
        }
        if(uploadLimit){const fd=new FormData(e.currentTarget);const bytes=[...fd.values()].reduce((n,v)=>n+(v instanceof File?v.size:0),0);if(bytes>uploadLimit){e.preventDefault();setLocalError("Choose files totalling no more than "+Math.floor(uploadLimit/1000000)+" MB.");return;}}
        setLocalError("");locked.current = true;
      }}
      className={s.form}
    >
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="source" value={source} />
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      <fieldset
        disabled={pending || state.uncertain || (uncertain && state.ok && op !== "avatar")}
        style={{
          border: 0,
          padding: 0,
          margin: 0,
          minWidth: 0,
          display: "grid",
          gap: 12,
        }}
      >
        {children}
        <button className={s.button} type="submit">
          {pending
            ? ar
              ? "\u062c\u0627\u0631\u064d \u0627\u0644\u062d\u0641\u0638..."
              : "Saving..."
            : label}
        </button>
      </fieldset>
      {localError&&<p role="alert">{localError}</p>}
      {state.message && (
        <p role={state.ok ? "status" : "alert"}>{state.message}</p>
      )}
      {uncertain && (
        <p className={s.muted}>
          {ar
            ? "\u0641\u064a \u062d\u0627\u0644 \u0627\u0646\u0642\u0637\u0627\u0639 \u0627\u0644\u0627\u062a\u0635\u0627\u0644\u060c \u062a\u062d\u0642\u0642 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0642\u0628\u0644 \u0627\u0644\u0645\u062d\u0627\u0648\u0644\u0629 \u0645\u062c\u062f\u062f\u0627\u064b."
            : "If the connection is interrupted, check the list before submitting again."}
        </p>
      )}
    </form>
  );
}
