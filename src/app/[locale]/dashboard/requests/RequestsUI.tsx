import Link from "next/link";
import {
  ClipboardList,
  ArrowDown,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Info,
  Send,
  Check,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import type { ServiceRequest } from "@/lib/api/patient-dashboard";
import Form from "../_patient/Form";
import RequestFields from "./RequestFields";
import s from "./requests-ui.module.css";
function date(value: string | null, ar: boolean) {
  if (!value)
    return ar ? "\u063a\u064a\u0631 \u0645\u062d\u062f\u062f" : "Not specified";
  const d = new Date(value.length === 10 ? value + "T12:00:00+03:00" : value);
  return Number.isFinite(+d)
    ? new Intl.DateTimeFormat(ar ? "ar-SA-u-ca-gregory" : "en-GB", {
        dateStyle: "medium",
        timeZone: "Asia/Riyadh",
      }).format(d)
    : value;
}
export function RequestsLayout({
  children,
  ar,
}: {
  children: ReactNode;
  ar: boolean;
}) {
  return (
    <div className={s.page}>
      <header className={s.header}>
        <div className={s.titleGroup}>
          <span className={s.headerIcon}>
            <ClipboardList size={24} />
          </span>
          <div>
            <span className={s.eyebrow}>
              {ar
                ? "\u062e\u062f\u0645\u0627\u062a \u062a\u0646\u0627\u0633\u0628 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643"
                : "A LITTLE HELP, ON YOUR TERMS"}
            </span>
            <h1>
              {ar
                ? "\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0627\u062a"
                : "Service requests"}
            </h1>
            <p>
              {ar
                ? "\u0623\u062e\u0628\u0631\u0646\u0627 \u0628\u0645\u0627 \u062a\u062d\u062a\u0627\u062c\u0647 \u0648\u062a\u0627\u0628\u0639 \u0637\u0644\u0628\u0627\u062a\u0643 \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f."
                : "Tell us what you need and keep track of your requests in one place."}
            </p>
          </div>
        </div>
        <a href="#request-history" className={s.historyLink}>
          {ar
            ? "\u0633\u062c\u0644 \u0627\u0644\u0637\u0644\u0628\u0627\u062a"
            : "Request history"}
          <ArrowDown size={15} />
        </a>
      </header>
      {children}
    </div>
  );
}
export default function RequestsUI({
  rows,
  services,
  catalogError,
  base,
  ar,
  total,
}: {
  rows: ServiceRequest[];
  services: { id: number; name: string }[];
  catalogError: boolean;
  base: string;
  ar: boolean;
  total?: number;
}) {
  const names = new Map(services.map((r) => [r.id, r.name]));
  return (
    <>
      <div className={s.workspace}>
        <section className={s.card} id="new-request">
          <div className={s.cardHead}>
            <span className={s.smallIcon}>
              <Plus size={20} />
            </span>
            <div>
              <h2>
                {ar
                  ? "\u0637\u0644\u0628 \u062e\u062f\u0645\u0629 \u062c\u062f\u064a\u062f"
                  : "Create a new request"}
              </h2>
              <p>
                {ar
                  ? "\u0623\u0636\u0641 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644 \u0644\u0645\u0633\u0627\u0639\u062f\u062a\u0646\u0627 \u0639\u0644\u0649 \u0641\u0647\u0645 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643."
                  : "A few details help the service team understand what you need."}
              </p>
            </div>
          </div>
          {catalogError ? (
            <div className={s.notice} role="alert">
              <Info size={18} />
              <p>
                Services could not be loaded. Please refresh this page and try
                again.
              </p>
            </div>
          ) : !services.length ? (
            <div className={s.notice}>
              <Info size={18} />
              <p>
                No services are available to request right now. Please check
                again later.
              </p>
            </div>
          ) : (
            <Form
              op="request"
              source="d4h"
              label={
                ar
                  ? "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628"
                  : "Submit service request"
              }
              uncertain
            >
              <RequestFields services={services} ar={ar} />
            </Form>
          )}
        </section>
        <aside className={s.side}>
          <section className={s.guide}>
            <span className={s.guideIcon}>
              <Send size={21} />
            </span>
            <h2>
              {ar
                ? "\u0645\u0627\u0630\u0627 \u064a\u062d\u062f\u062b \u0628\u0639\u062f \u0630\u0644\u0643\u061f"
                : "A simple way to get started"}
            </h2>
            <ol>
              {[
                {
                  icon: <ClipboardList size={15} />,
                  title: ar
                    ? "\u062d\u062f\u062f \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643"
                    : "Share your needs",
                  text: ar
                    ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0648\u0623\u0636\u0641 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644."
                    : "Choose your services and add the details.",
                },
                {
                  icon: <Send size={15} />,
                  title: ar
                    ? "\u0623\u0631\u0633\u0644 \u0637\u0644\u0628\u0643"
                    : "Send your request",
                  text: ar
                    ? "\u064a\u0633\u062a\u0644\u0645 \u0641\u0631\u064a\u0642 \u0627\u0644\u062e\u062f\u0645\u0629 \u0637\u0644\u0628\u0643 \u0644\u0645\u0631\u0627\u062c\u0639\u062a\u0647."
                    : "Your request is shared with the service team.",
                },
                {
                  icon: <Check size={15} />,
                  title: ar
                    ? "\u062a\u0627\u0628\u0639 \u0627\u0644\u062d\u0627\u0644\u0629"
                    : "Keep track",
                  text: ar
                    ? "\u0631\u0627\u062c\u0639 \u062d\u0627\u0644\u0629 \u0637\u0644\u0628\u0643 \u0641\u064a \u0627\u0644\u0633\u062c\u0644."
                    : "Check your request's status in the history below.",
                },
              ].map((step) => (
                <li key={step.title}>
                  <span>{step.icon}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={s.guideNote}>
              <Info size={16} />
              <p>
                {ar
                  ? "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628 \u0644\u0627 \u064a\u0624\u0643\u062f \u062d\u062c\u0632\u0627\u064b \u0648\u0644\u0627 \u064a\u062a\u0631\u062a\u0628 \u0639\u0644\u064a\u0647 \u062f\u0641\u0639."
                  : "Submitting a request does not confirm a booking or take a payment."}
              </p>
            </div>
          </section>
        </aside>
      </div>
      <section id="request-history" className={s.history}>
        <header className={s.historyHead}>
          <div>
            <h2>
              {ar ? "\u0637\u0644\u0628\u0627\u062a\u0643" : "Your requests"}
              {total !== undefined && <span className={s.count}>{total}</span>}
            </h2>
            <p>
              {ar
                ? "\u062a\u0641\u0627\u0635\u064a\u0644 \u0637\u0644\u0628\u0627\u062a\u0643 \u0648\u062d\u0627\u0644\u062a\u0647\u0627."
                : "Your submitted requests and their latest status."}
            </p>
          </div>
        </header>
        {rows.length ? (
          <div className={s.requestGrid}>
            {rows.map((r) => (
              <article className={s.requestCard} key={r.id}>
                <div className={s.requestTop}>
                  <span className={s.reference}>#{r.id}</span>
                  <span className={s.status}>
                    {r.status.replaceAll("_", " ")}
                  </span>
                </div>
                <h3>{r.title}</h3>
                <p className={s.description}>{r.description}</p>
                <div className={s.tags}>
                  {r.service_ids.map((id) => (
                    <span key={id}>
                      {names.get(id) ??
                        (ar ? "\u062e\u062f\u0645\u0629 #" : "Service #") + id}
                    </span>
                  ))}
                </div>
                <div className={s.requestMeta}>
                  <span>
                    <CalendarDays size={14} />
                    {date(r.preferred_date, ar)}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {date(r.created_at, ar)}
                  </span>
                </div>
                <Link className={s.detailLink} href={base + "/" + r.id}>
                  {ar
                    ? "\u0639\u0631\u0636 \u0627\u0644\u0637\u0644\u0628"
                    : "View request"}
                  <ArrowUpRight size={15} />
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={s.empty}>
            <span>
              <ClipboardList size={25} />
            </span>
            <h3>
              {ar
                ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u0637\u0644\u0628\u0627\u062a \u0628\u0639\u062f"
                : "Your requests will appear here"}
            </h3>
            <p>
              {ar
                ? "\u0623\u0646\u0634\u0626 \u0637\u0644\u0628\u0643 \u0627\u0644\u0623\u0648\u0644 \u0628\u0627\u0633\u062a\u062e\u062f\u0627\u0645 \u0627\u0644\u0646\u0645\u0648\u0630\u062c \u0623\u0639\u0644\u0627\u0647."
                : "Start with the form above. Once submitted, you can review your request details here."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
