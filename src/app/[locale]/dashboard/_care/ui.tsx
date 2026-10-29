import { useUiText } from "@/i18n/use-ui-text";
import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";
import type {
  Bilingual,
  CarePage,
  ClinicalSummary,
} from "@/lib/api/zuwara/care";
import s from "./care.module.css";
export function bilingual(value: Bilingual | undefined, ar: boolean) {
  return value?.[ar ? "ar" : "en"] || value?.en || value?.ar || "\u2014";
}
export function currency(amount: number, code = "SAR", ar = false) {
  return new Intl.NumberFormat(ar ? "ar-SA" : "en-GB", {
    style: "currency",
    currency: code,
  }).format(amount / 100);
}
export function stamp(value: string | null | undefined, ar = false) {
  if (!value) return "?";
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Riyadh",
      }).format(d)
    : value;
}
export function Facts({ rows }: { rows: [string, ReactNode][] }) {
  const uiText = useUiText();
  return (
    <dl className={s.facts}>
      {rows.map(([label, value]) => (
        <div key={label} style={{ display: "contents" }}>
          <dt>{label}</dt>
          <dd>
            {value === null || value === undefined || value === ""
              ? "\u2014"
              : typeof value === "boolean"
                ? value
                  ? uiText("Yes")
                  : uiText("No")
                : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Clinical({
  title,
  data,
}: {
  title: string;
  data: ClinicalSummary | null;
}) {
  const uiText = useUiText();
  return (
    <section className={s.card}>
      <h2>{title}</h2>
      {data ? (
        <Facts
          rows={[
            [uiText("Subject"), data.subject],
            [uiText("Objective"), data.objective],
            [uiText("Assessment"), data.assessment],
            [uiText("Diagnosis"), data.diagnosed_with],
            [uiText("Plan"), data.plan],
            [uiText("Follow-up instructions"), data.instructions_followup],
          ]}
        />
      ) : (
        <p className={s.muted}>{uiText("No summary provided.")}</p>
      )}
    </section>
  );
}
export async function CareLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const uiText = await getUiText();
  const ar = (await getLocale()) === "ar",
    p = ar ? "/ar" : "";
  const links = [
    [uiText("Therapy"), "\u0627\u0644\u0639\u0644\u0627\u062c", "therapy"],
    [
      uiText("Rescheduling"),
      "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629",
      "rescheduling",
    ],
    [
      "Follow-ups",
      "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a",
      "follow-ups",
    ],
    [uiText("Benefits"), "\u0627\u0644\u0645\u0632\u0627\u064a\u0627", "benefits"],
    [
      uiText("Home visits"),
      "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629",
      "home-visits",
    ],
  ];
  return (
    <div className={s.page}>
      <header className={s.head}>
        <div>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
      </header>
      <nav className={s.nav}>
        {links.map(([en, arabic, path]) => (
          <Link key={path} href={p + "/dashboard/" + path}>
            {ar ? arabic : en}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
export function Pager({
  data,
  href,
}: {
  data: Pick<CarePage<unknown>, "page" | "total" | "perPage" | "hasMore">;
  href: (page: number) => string;
}) {
  const uiText = useUiText();
  return (
    <nav className={s.pager} aria-label={uiText("Pagination")}>
      {data.page > 1 ? <Link href={href(data.page - 1)}>{uiText("Previous")}</Link> : null}
      <span>
        {uiText("Page")}{" "}{data.page} ? {data.total} {uiText("results")}{" "}</span>
      {data.hasMore ? <Link href={href(data.page + 1)}>{uiText("Next")}</Link> : null}
    </nav>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <div className={s.empty}>{children}</div>;
}
export { s };
