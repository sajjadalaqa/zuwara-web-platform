import type { ReactNode } from "react";
import s from "./profile.module.css";

export default function Field({
  id, label, error, hint, full, children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  full?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`${s.field} ${full ? s.full : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error ? (
        <p className={s.error} role="alert">{error}</p>
      ) : hint ? (
        <p className={s.hint}>{hint}</p>
      ) : null}
    </div>
  );
}