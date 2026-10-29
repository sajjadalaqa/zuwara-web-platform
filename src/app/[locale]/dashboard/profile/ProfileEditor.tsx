import { getUiText } from "@/i18n/server-ui-text";
import { patientApi } from "@/lib/auth/session";
import Form from "../_patient/Form";
import s from "./profile.module.css";
export default async function ProfileEditor() {
  const uiText = await getUiText();
  const { data: p } = await patientApi<{
    full_name: string;
    full_name_ar: string | null;
    email: string | null;
    city: string | null;
    date_of_birth: string | null;
    gender: number | null;
    national_id: string | null;
  }>("/patients/me");
  return (
    <Form op="profile" label={uiText("Save profile")}>
      <div className={s.grid2}>
        {[
          ["full_name", uiText("Full name"), p.full_name, 150],
          ["full_name_ar", uiText("Arabic full name"), p.full_name_ar, 150],
          ["email", uiText("Email"), p.email, 190],
          ["city", uiText("City"), p.city, 150],
          ["national_id", uiText("National ID"), p.national_id, 20],
        ].map(([name, label, value, max]) => (
          <label key={String(name)}>
            {label}
            <input
              className={s.input}
              name={String(name)}
              defaultValue={String(value ?? "")}
              maxLength={Number(max)}
              type={name === "email" ? "email" : "text"}
              required={name === "full_name"}
            />
          </label>
        ))}
        <label>
          {uiText("Date of birth")}{" "}<input
            name="date_of_birth"
            className={s.input}
            type="date"
            defaultValue={p.date_of_birth ?? ""}
          />
        </label>
        <label>
          {uiText("Gender")}{" "}<select
            className={s.input}
            name="gender"
            defaultValue={p.gender ?? ""}
          >
            <option value="">{uiText("Not specified")}</option>
            <option value="0">0</option>
            <option value="1">1</option>
          </select>
        </label>
      </div>
      <p>{uiText("Phone changes require a separate verified identity flow.")}</p>
    </Form>
  );
}
