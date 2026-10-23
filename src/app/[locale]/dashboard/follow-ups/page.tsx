import Link from "next/link";
import { getLocale } from "next-intl/server";
import { careList, type FollowUp } from "@/lib/api/zuwara/care";
import { stamp } from "../_care/ui";
import FollowUpLayout from "./FollowUpLayout";
import s from "./follow-ups.module.css";
import { CalendarDays, Clock3, Hourglass, ArrowUpRight, ListFilter, Stethoscope, SlidersHorizontal } from "lucide-react";
export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const status = ["scheduled", "available", "completed", "expired"].includes(
    sp.status || "",
  )
    ? sp.status
    : "";
  const query = new URLSearchParams(status ? { status } : {});
  const data = await careList<FollowUp>(
    "/follow-ups",
    Number(sp.page) || 1,
    query,
  );
  const pageHref=(page:number)=>prefix+"/dashboard/follow-ups?"+new URLSearchParams({page:String(page),...(status?{status}:{})});
  return (<FollowUpLayout ar={ar}>
<div className={s.toolbar}><div className={s.toolbarTitle}><ListFilter size={22}/><div><h2>{ar?"\u0645\u062a\u0627\u0628\u0639\u0627\u062a\u0643":"Your follow-up sessions"}</h2><p>{data.total} {ar?"\u0645\u062a\u0627\u0628\u0639\u0629":"follow-ups"} &middot; {ar?"\u0627\u0644\u0635\u0641\u062d\u0629":"Page"} {data.page}</p></div></div>
      <form className={s.filter}>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">All</option>
            {["scheduled", "available", "completed", "expired"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button><SlidersHorizontal size={14}/>Filter</button>
      </form></div>
      <div className={s.grid}>
        {data.items.map((item) => (
          <article className={s.card} data-status={item.status} key={item.id}><div className={s.cardHead}><span className={s.cardIcon}><Stethoscope size={22}/></span><span className={s.badge}><span className={s.dot}/>{ar?item.status_label_ar:item.status_label}</span></div><div className={s.cardBody}><p className={s.eyebrow}>{ar?"\u0645\u062a\u0627\u0628\u0639\u0629":"Follow-up session"}</p><h3>{ar?"\u0627\u0644\u0645\u0648\u0639\u062f":"Appointment"} #{item.appointment_id}</h3><div className={s.timeline}><div className={s.timelineRow}><span className={s.timelineIcon}><CalendarDays size={16}/></span><div><p>{ar?"\u0627\u0644\u0645\u0648\u0639\u062f \u0627\u0644\u0645\u062c\u062f\u0648\u0644":"Scheduled for"}</p><strong>{stamp(item.scheduled_at,ar)}</strong></div></div><div className={s.timelineRow}><span className={s.timelineIcon}><Hourglass size={16}/></span><div><p>{ar?"\u064a\u0646\u062a\u0647\u064a \u0627\u0644\u0648\u0635\u0648\u0644":"Access ends"}</p><strong>{stamp(item.available_until,ar)}</strong></div></div></div><div className={s.duration}><span><Clock3 size={15}/>{ar?"\u0645\u062f\u0629 \u0627\u0644\u062c\u0644\u0633\u0629":"Session length"}</span><strong>{item.duration_minutes} {ar?"\u062f\u0642\u064a\u0642\u0629":"min"}</strong></div><Link className={s.view} href={prefix+"/dashboard/follow-ups/"+item.id}>{ar?"\u0639\u0631\u0636 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629":"View follow-up"}<ArrowUpRight size={17}/></Link></div></article>
        ))}
      </div>
      {!data.items.length ? (
        <div className={s.empty}><Stethoscope size={30}/><h2>No follow-ups to show</h2><p>Try a different status to find a session. Follow-ups are scheduled by your consultant.</p></div>
      ) : null}
<nav className={s.pagination} aria-label="Follow-up pages"><span>{data.total} follow-ups &middot; Page {data.page}</span><div>{data.page>1&&<Link href={pageHref(data.page-1)}>Previous</Link>}<span aria-current="page">{data.page}</span>{data.hasMore&&<Link href={pageHref(data.page+1)}>Next</Link>}</div></nav>
    </FollowUpLayout>
  );
}
