"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { useLocale } from "next-intl";
import { useEffect, useId, useRef, useState, type InputHTMLAttributes } from "react";
import { Icon, type IconName } from "./icons";
import { passwordScore, strengthLabel } from "./validators";
import s from "./auth.module.css";
import "flag-icons/css/flag-icons.min.css";
import { COUNTRIES, POPULAR_COUNT } from "./countries";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  icon: IconName;
  error?: string;
  optional?: boolean;
  showStrength?: boolean;
  onChange: (value: string) => void;
}

export function Field({ label, icon, error, optional, showStrength, onChange, type = "text", value, ...rest }: FieldProps) {
  const uiText = useUiText();
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  const score = passwordScore(String(value ?? ""));

  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>
        {label}
        {optional ? <span className={s.opt}> {uiText("(Optional)")}</span> : rest.required && <span className={s.req}>*</span>}
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
            aria-label={show ? uiText("Hide password") : uiText("Show password")}>
            <Icon name={show ? "eye" : "eyeOff"} />
          </button>
        )}
      </div>
      {showStrength && String(value).length > 0 && (
        <>
          <div className={s.meter} aria-hidden="true">
            {[1, 2, 3, 4].map((n) => <span key={n} className={score >= n ? s[`on${score}`] : ""} />)}
          </div>
          <p className={s.hint}>{uiText("Password strength:")}{" "}{uiText(strengthLabel[score])}</p>
        </>
      )}
      {error && <p id={`${id}-err`} className={s.error} role="alert"><Icon name="alert" size={14} />{uiText(error)}</p>}
    </div>
  );
}


function Flag({ iso, name }: { iso: string; name: string }) {
  return <span className={`fi fi-${iso} ${s.flag}`} role="img" aria-label={name} />;
}

interface PhoneProps {
  label: string; dial: string; number: string; error?: string;
  onDial: (v: string) => void; onNumber: (v: string) => void;
}
const MENU_NEED = 330;   // approx. full menu height
const TOP_GAP = 140;     // keep clear of your sticky site header
const BOTTOM_GAP = 16;
export function PhoneField({ label, dial, number, error, onDial, onNumber }: PhoneProps) {
  const uiText = useUiText();
  const locale = useLocale();
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const countryName = (country: (typeof COUNTRIES)[number]) => regions.of(country.iso.toUpperCase()) ?? country.name;
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Tracked by ISO because some countries share a dial code (US/Canada, Russia/Kazakhstan)
  const [iso, setIso] = useState(() => (COUNTRIES.find((c) => c.code === dial) ?? COUNTRIES[0]).iso);
  const [place, setPlace] = useState({ up: false, maxH: 260 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const current = COUNTRIES.find((c) => c.iso === iso) ?? COUNTRIES[0];

  const q = query.trim().toLowerCase();
  const list = q
    ? COUNTRIES.filter((c) => countryName(c).toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.code.includes(q))
    : COUNTRIES;

  const close = () => { setOpen(false); setQuery(""); };

  useEffect(() => {
  if (!open) return;
  searchRef.current?.focus({ preventScroll: true });
  const onDown = (e: MouseEvent) => {
    if (!wrapRef.current?.contains(e.target as Node)) close();
  };
  const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
  document.addEventListener("mousedown", onDown);
  document.addEventListener("keydown", onKey);
  window.addEventListener("resize", close);
  return () => {
    document.removeEventListener("mousedown", onDown);
    document.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", close);
  };
}, [open]);

  const pick = (c: (typeof COUNTRIES)[number]) => {
    setIso(c.iso);
    onDial(c.code);
    close();
  };
const toggle = () => {
  if (open) return close();
  const r = wrapRef.current!.getBoundingClientRect();
  const below = window.innerHeight - r.bottom - BOTTOM_GAP;
  const above = r.top - TOP_GAP;
  const up = below < MENU_NEED && above > below;
  const space = up ? above : below;
  setPlace({ up, maxH: Math.max(140, Math.min(260, space - 62)) });
  setOpen(true);
};
  return (
    <div className={s.field}>
      <label htmlFor={id} className={s.label}>{label}<span className={s.req}>*</span></label>
      <div className={s.dialWrap} ref={wrapRef}>
        <div className={`${s.control} ${error ? s.invalid : ""}`}>
          <button type="button" className={s.dialBtn} onClick={toggle}
            aria-haspopup="listbox" aria-expanded={open} aria-label={uiText("Country code")}>
            <Flag iso={current.iso} name={countryName(current)} />
            <span className={s.dialCode} dir="ltr">{current.code}</span>
            <span className={`${s.chev} ${open ? s.chevOpen : ""}`} aria-hidden="true">▾</span>
          </button>
          <input id={id} className={s.input} style={{ paddingInlineStart: 14 }} type="tel" inputMode="tel" dir="ltr"
            placeholder={uiText("e.g. 5xx xxx xxxx")} value={number} aria-invalid={!!error}
            onChange={(e) => onNumber(e.target.value.replace(/[^\d\s]/g, ""))} />
        </div>

        {open && (
          <div className={`${s.menu} ${place.up ? s.menuUp : ""}`}>
            <input ref={searchRef} className={s.search} type="text" placeholder={uiText("Search country or code")}
              value={query} onChange={(e) => setQuery(e.target.value)} aria-label={uiText("Search country")} />
            <ul className={s.list} style={{ maxHeight: place.maxH }} role="listbox" aria-label={uiText("Select country code")}>
              {list.length === 0 && <li className={s.empty}>{uiText("No country found")}</li>}
              {list.map((c, i) => (
                <li key={c.iso} role="option" aria-selected={c.iso === iso}
                  className={`${s.opt2} ${c.iso === iso ? s.opt2Active : ""} ${!q && i === POPULAR_COUNT ? s.optSep : ""}`}
                  onClick={() => pick(c)}>
                  <Flag iso={c.iso} name={countryName(c)} />
                  <span className={s.optName}>{countryName(c)}</span>
                  <span className={s.optCode} dir="ltr">{c.code}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className={s.error} role="alert"><Icon name="alert" size={14} />{uiText(error)}</p>}
    </div>
  );
}
  

export function SubmitButton({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  const uiText = useUiText();
  return (
    <button type="submit" className={s.btn} disabled={loading}>
      {loading ? <span className={s.spinner} aria-label={uiText("Loading")} /> : <>{children}<Icon name="arrowRight" size={18} /></>}
    </button>
  );
}
