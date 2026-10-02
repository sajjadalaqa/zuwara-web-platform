"use client";
import { useId, useState, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./icons";
import { passwordScore, strengthLabel } from "./validators";
import s from "./auth.module.css";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  icon: IconName;
  error?: string;
  optional?: boolean;
  showStrength?: boolean;
  onChange: (value: string) => void;
}

export function Field({ label, icon, error, optional, showStrength, onChange, type = "text", value, ...rest }: FieldProps) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const score = passwordScore(String(value ?? ""));

  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
        {optional ? <span className={s.opt}> (Optional)</span> : rest.required && <span className={s.req}>*</span>}
      </label>
      <div className={`${s.control} ${error ? s.invalid : ""}`}>
        <span className={s.icon}><Icon name={icon} /></span>
        <input
          id={id} className={s.input} value={value} type={isPw && show ? "text" : type}
          aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined}
          onChange={(e) => onChange(e.target.value)} {...rest}
        />
        {isPw && (
          <button type="button" className={s.toggle} onClick={() => setShow(!show)}
            aria-label={show ? "Hide password" : "Show password"}>
            <Icon name={show ? "eye" : "eyeOff"} />
          </button>
        )}
      </div>
      {showStrength && String(value).length > 0 && (
        <>
          <div className={s.meter} aria-hidden="true">
            {[1, 2, 3, 4].map((n) => <span key={n} className={score >= n ? s[`on${score}`] : ""} />)}
          </div>
          <p className={s.hint}>Password strength: {strengthLabel[score]}</p>
        </>
      )}
      {error && <p id={`${id}-err`} className={s.error} role="alert"><Icon name="alert" size={14} />{error}</p>}
    </div>
  );
}

const COUNTRIES = [
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
];

interface PhoneProps {
  label: string; dial: string; number: string; error?: string;
  onDial: (v: string) => void; onNumber: (v: string) => void;
}

/** Country code + number. Swap for react-international-phone later if you need full country data. */
export function PhoneField({ label, dial, number, error, onDial, onNumber }: PhoneProps) {
  const id = useId();
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}<span className={s.req}>*</span></label>
      <div className={`${s.control} ${error ? s.invalid : ""}`}>
        <select className={s.phoneCode} value={dial} onChange={(e) => onDial(e.target.value)} aria-label="Country code">
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
        </select>
        <input id={id} className={s.input} style={{ paddingInlineStart: 14 }} type="tel" inputMode="tel"
          placeholder="e.g. +123 932545676" value={number} aria-invalid={!!error}
          onChange={(e) => onNumber(e.target.value.replace(/[^\d\s]/g, ""))} />
      </div>
      {error && <p className={s.error} role="alert"><Icon name="alert" size={14} />{error}</p>}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" className={s.btn} disabled={loading}>
      {loading ? <span className={s.spinner} aria-label="Loading" /> : <>{children}<Icon name="arrowRight" size={18} /></>}
    </button>
  );
}