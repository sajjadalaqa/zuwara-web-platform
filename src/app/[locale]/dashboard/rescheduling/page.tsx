import Link from "next/link";
import { getLocale } from "next-intl/server";
import { careList, type Reschedule } from "@/lib/api/zuwara/care";
import {
  Facts,
  currency,
  stamp,
} from "../_care/ui";
import Respond from "./Respond";
import { CalendarClock, CalendarDays, Clock3, ArrowRight, ArrowUpRight, SlidersHorizontal, Info } from "lucide-react";
import ui from "./rescheduling.module.css";
export default async function ReschedulingPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    kind?: string;
    appointment_id?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    query = new URLSearchParams();
  if (["pending", "approved", "rejected"].includes(sp.status || ""))
    query.set("status", sp.status!);
  if (["normal", "therapy"].includes(sp.kind || ""))
    query.set("kind", sp.kind!);
  if (sp.appointment_id && /^[1-9]\d*$/.test(sp.appointment_id))
    query.set("appointment_id", sp.appointment_id);
  const data = await careList<Reschedule>(
    "/reschedule-requests",
    Number(sp.page) || 1,
    query,
  );
  function pageHref(page: number) { const q=new URLSearchParams(query); q.set("page",String(page)); return prefix+"/dashboard/rescheduling?"+q; }
  return (
    <div className={ui.page} dir={ar?"rtl":"ltr"}>
<header className={ui.header}><span className={ui.headerIcon}><CalendarClock size={25}/></span><div><h1>{ar?"\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629":"Reschedule requests"}</h1><p>{ar?"\u064a\u0628\u0642\u0649 \u0645\u0648\u0639\u062f\u0643 \u0643\u0645\u0627 \u0647\u0648 \u062d\u062a\u0649 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629 \u0639\u0644\u0649 \u0627\u0644\u0637\u0644\u0628.":"Keep track of time changes. Your appointment stays the same until a request is approved."}</p></div></header>
<nav className={ui.nav} aria-label="Care journeys">{[["Therapy","therapy"],["Rescheduling","rescheduling"],["Follow-ups","follow-ups"],["Benefits","benefits"],["Home visits","home-visits"]].map(([label,path])=><Link key={path} href={prefix+"/dashboard/"+path} aria-current={path==="rescheduling"?"page":undefined}>{label}</Link>)}</nav>
      <form className={ui.filters}><span className={ui.filterIcon}><SlidersHorizontal size={19}/></span>
        <label>
          Status
          <select name="status" defaultValue={sp.status || ""}>
            <option value="">All</option>
            {["pending", "approved", "rejected"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Kind
          <select name="kind" defaultValue={sp.kind || ""}>
            <option value="">All</option>
            <option value="normal">Normal</option>
            <option value="therapy">Therapy</option>
          </select>
        </label>
        {sp.appointment_id ? (
          <input
            type="hidden"
            name="appointment_id"
            value={sp.appointment_id}
          />
        ) : null}
        <button>Apply filters</button>
      </form>
      <div className={ui.cards}>{data.items.map((item) => (
        <section className={ui.card} key={item.id}><header className={ui.cardHead}><div className={ui.identity}><span><CalendarClock size={21}/></span><div>
          <h2>
            {item.appointment_number || "Appointment " + item.appointment_id}
          </h2><p>Request #{item.id} &middot; {item.kind}</p></div></div><span className={ui.status} data-status={item.status}>{item.status}</span></header><div className={ui.body}>
<div className={ui.schedule}><div className={ui.timeBox}><span><CalendarDays size={15}/>Previous appointment</span><strong>{item.previous.date || "\u2014"}</strong><p><Clock3 size={14}/>{item.previous.time || "\u2014"}{item.previous.duration_minutes != null && <span>&middot; {item.previous.duration_minutes} min</span>}</p></div><span className={ui.arrow}><ArrowRight size={22}/></span><div className={ui.timeBox+" "+ui.requested}><span><CalendarClock size={15}/>Requested appointment</span><strong>{item.requested.date || "\u2014"}</strong><p><Clock3 size={14}/>{item.requested.time || "\u2014"}{item.requested.duration_minutes != null && <span>&middot; {item.requested.duration_minutes} min</span>}</p></div></div>
{item.reason && <p className={ui.reason}><strong>Reason: </strong>{item.reason}</p>}
<details className={ui.details}><summary>Request &amp; payment details</summary><Facts
            rows={[
              ["Request", item.id],
              ["Kind", item.kind],
              ["Status", item.status],
              ["Requested by", item.requested_by],
              ["Doctor reference", item.doctor_id],
              ["Therapy group", item.session_group_id],
              ["Previous date", item.previous.date],
              ["Previous time", item.previous.time],
              ["Previous duration", item.previous.duration_minutes],
              ["Requested date", item.requested.date],
              ["Requested time", item.requested.time],
              ["Requested duration", item.requested.duration_minutes],
              ["Duration change", item.duration_change],
              ["Reason", item.reason],
              ["Rejection reason", item.reject_reason],
              [
                "Extra paid",
                currency(
                  item.payment.extra_paid_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              [
                "Credit used",
                currency(
                  item.payment.credit_used_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              [
                "Upgrade required",
                currency(
                  item.payment.required_upgrade_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              ["Extra payment recorded", item.payment.has_extra_payment],
              ["Payment method", item.payment.method],
              [
                "Automatic refund on rejection",
                item.payment.automatic_refund_on_rejection,
              ],
              ["Created", stamp(item.created_at, ar)],
              ["Updated", stamp(item.updated_at, ar)],
            ]}
          />
          </details><p className={ui.notice}><Info size={15}/>
            A downgrade or rejection does not automatically create a refund
            unless the backend explicitly confirms one.
          </p>
          {item.kind === "therapy" &&
          item.status === "pending" &&
          ["doctor", "consultant"].includes(item.requested_by) ? (
            <div className={ui.response}><Respond id={String(item.id)} /></div>
          ) : null}
        </div><footer className={ui.footer}>          <Link
            href={prefix + "/dashboard/appointments/" + item.appointment_id}
          >
            Appointment details <ArrowUpRight size={16}/>
          </Link>
<span>Updated {stamp(item.updated_at, ar)}</span></footer></section>
      ))}</div>
      {!data.items.length ? (
        <div className={ui.empty}><CalendarClock size={30}/><h2>No matching requests</h2><p>Try another status or appointment type to find a request.</p></div>
      ) : null}
      <div className={ui.pagination}><nav aria-label="Reschedule request pages"><span>Page {data.page} &middot; {data.total} requests</span>{data.page>1&&<Link href={pageHref(data.page-1)}>Previous</Link>}{data.hasMore&&<Link href={pageHref(data.page+1)}>Next</Link>}</nav>
      </div>
    </div>
  );
}
