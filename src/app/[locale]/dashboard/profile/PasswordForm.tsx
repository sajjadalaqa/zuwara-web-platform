"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordAction } from "./actions";
import type { Copy } from "./copy";
import Field from "./Field";
import { initialFormState } from "./types";
import s from "./profile.module.css";

function PasswordInput({
  id, name, autoComplete, invalid, show, hide,
}: {
  id: string;
  name: string;
  autoComplete: string;
  invalid: boolean;
  show: string;
  hide: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={s.locked}>
      <input
        id={id} name={name} type={visible ? "text" : "password"} dir="ltr"
        className={s.input} autoComplete={autoComplete} aria-invalid={invalid}
      />
      <button
        type="button" className={s.eye}
        onClick={() => setVisible((x) => !x)}
        aria-label={visible ? hide : show}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default function PasswordForm({ t }: { t: Copy }) {
  const [state, action, pending] = useActionState(changePasswordAction, initialFormState);

  const err = (key: string) => {
    const code = state.errors?.[key];
    return code ? t.errors[code] : undefined;
  };
  const formError = err("_form");
  const p = t.security;

  return (
    <form action={action} className={s.form} noValidate>
      {state.ok && <p className={`${s.banner} ${s.bannerOk}`} role="status">{p.saved}</p>}
      {formError && <p className={`${s.banner} ${s.bannerErr}`} role="alert">{formError}</p>}

      <Field id="current" label={p.current} error={err("current")}>
        <PasswordInput id="current" name="current" autoComplete="current-password"
          invalid={!!err("current")} show={p.show} hide={p.hide} />
      </Field>
      <Field id="next" label={p.next} error={err("next")} hint={p.rules}>
        <PasswordInput id="next" name="next" autoComplete="new-password"
          invalid={!!err("next")} show={p.show} hide={p.hide} />
      </Field>
      <Field id="confirm" label={p.confirm} error={err("confirm")}>
        <PasswordInput id="confirm" name="confirm" autoComplete="new-password"
          invalid={!!err("confirm")} show={p.show} hide={p.hide} />
      </Field>

      <div className={s.formActions}>
        <button type="submit" className={s.primary} disabled={pending}>
          {pending ? p.saving : p.save}
        </button>
      </div>
    </form>
  );
}