"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { updateProfileAction } from "./actions";
import type { Copy } from "./copy";
import Field from "./Field";
import { initialFormState, type Profile } from "./types";
import s from "./profile.module.css";

export default function ProfileForm({ profile, t }: { profile: Profile; t: Copy }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialFormState);
  const v = state.values;

  const err = (key: string) => {
    const code = state.errors?.[key];
    return code ? t.errors[code] : undefined;
  };
  const formError = err("_form");

  return (
    <form action={action} className={s.form} noValidate>
      {state.ok && <p className={`${s.banner} ${s.bannerOk}`} role="status">{t.personal.saved}</p>}
      {formError && <p className={`${s.banner} ${s.bannerErr}`} role="alert">{formError}</p>}

      <div className={s.grid2}>
        <Field id="fullName" label={t.personal.fullName} error={err("fullName")}>
          <input
            id="fullName" name="fullName" className={s.input} autoComplete="name"
            defaultValue={v?.fullName ?? profile.fullName}
            aria-invalid={!!err("fullName")}
          />
        </Field>

        <Field id="email" label={t.personal.email} hint={t.personal.emailHint}>
          <div className={s.locked}>
            <input id="email" className={s.input} value={profile.email} readOnly />
            <Lock size={15} className={s.lockIcon} />
          </div>
        </Field>

        <Field id="phone" label={t.personal.phone} error={err("phone")}>
          <input
            id="phone" name="phone" type="tel" dir="ltr" className={s.input} autoComplete="tel"
            placeholder="+966 50 123 4567"
            defaultValue={v?.phone ?? profile.phone}
            aria-invalid={!!err("phone")}
          />
        </Field>

        <Field id="city" label={t.personal.city} error={err("city")}>
          <input
            id="city" name="city" className={s.input} autoComplete="address-level2"
            defaultValue={v?.city ?? profile.city}
            aria-invalid={!!err("city")}
          />
        </Field>

        <Field id="dateOfBirth" label={t.personal.dob} error={err("dateOfBirth")}>
          <input
            id="dateOfBirth" name="dateOfBirth" type="date" className={s.input} autoComplete="bday"
            defaultValue={v?.dateOfBirth ?? profile.dateOfBirth}
            aria-invalid={!!err("dateOfBirth")}
          />
        </Field>

        <Field id="gender" label={t.personal.gender} error={err("gender")}>
          <select
            id="gender" name="gender" className={s.input}
            defaultValue={v?.gender ?? profile.gender}
          >
            <option value="">{t.personal.genderNone}</option>
            <option value="male">{t.personal.genderMale}</option>
            <option value="female">{t.personal.genderFemale}</option>
          </select>
        </Field>
      </div>

      <div className={s.formActions}>
        <button type="submit" className={s.primary} disabled={pending}>
          {pending ? t.personal.saving : t.personal.save}
        </button>
      </div>
    </form>
  );
}