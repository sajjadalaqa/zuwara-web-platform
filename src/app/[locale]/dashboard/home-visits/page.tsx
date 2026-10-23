import Link from "next/link";
import { getLocale } from "next-intl/server";
import { homeHistory } from "@/lib/api/d4h/history";
import { currency } from "../_care/ui";
import { HousePlus, Search, SlidersHorizontal, CalendarDays, Clock3, UserRound, ArrowUpRight, History } from "lucide-react";
import s from "./home-visits.module.css";
export default async function HomeVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const query = new URLSearchParams();
  if (sp.q?.trim()) query.set("q", sp.q.trim().slice(0, 200));
  if (sp.status && /^[a-z_]{1,40}$/.test(sp.status))
    query.set("status", sp.status);
  for (const key of ["from_date", "to_date"] as const) {
    if (sp[key] && /^\d{4}-\d{2}-\d{2}$/.test(sp[key]!))
      query.set(key, sp[key]!);
  }
  const data = await homeHistory(Number(sp.page) || 1, query);
  const pageHref=(page:number)=>{const q=new URLSearchParams(query);q.set("page",String(page));return prefix+"/dashboard/home-visits?"+q;};
  return (<div className={s.page} dir={ar?"rtl":"ltr"}><header className={s.header}><span className={s.headerIcon}><HousePlus size={25}/></span><div><h1>{ar?"\u0633\u062c\u0644 \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629":"Home-visit history"}</h1><p>{ar?"\u0645\u0648\u0627\u0639\u064a\u062f\u0643 \u0648\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f.":"Care at home, all in one place. Find your visits and revisit the details."}</p></div></header><nav className={s.nav} aria-label="Care journeys">{[["Therapy","therapy"],["Rescheduling","rescheduling"],["Follow-ups","follow-ups"],["Benefits","benefits"],["Home visits","home-visits"]].map(([label,path])=><Link key={path} href={prefix+"/dashboard/"+path} aria-current={path==="home-visits"?"page":undefined}>{label}</Link>)}</nav>
      <form className={s.filters}>
        <label>
          Search
          <span className={s.searchField}><Search size={17}/><input name="q" defaultValue={sp.q} placeholder={ar?"\u0627\u0628\u062d\u062b \u0641\u064a \u0632\u064a\u0627\u0631\u0627\u062a\u0643":"Search your visits..."}/></span>
        </label>
        <label>
          From
          <input type="date" name="from_date" defaultValue={sp.from_date} />
        </label>
        <label>
          To
          <input type="date" name="to_date" defaultValue={sp.to_date} />
        </label>
        <button><SlidersHorizontal size={16}/>Filter visits</button>
      </form>
<div className={s.sectionHead}><div><History size={19}/><h2>{ar?"\u0632\u064a\u0627\u0631\u0627\u062a\u0643":"Your visits"}</h2><span>{data.total}</span></div><p>{ar?"\u0627\u0644\u0635\u0641\u062d\u0629":"Page"} {data.page}</p></div>
      <div className={s.grid}>
        {data.items.map((item) => (
<article className={s.card} data-status={item.status} key={item.id}><div className={s.cardHead}><span className={s.cardIcon}><HousePlus size={23}/></span><span className={s.badge}><span className={s.dot}/>{item.status.replace(/_/g," ")}</span></div><div className={s.cardBody}><p className={s.eyebrow}>{ar?"\u0632\u064a\u0627\u0631\u0629 \u0645\u0646\u0632\u0644\u064a\u0629":"Home visit"} &middot; #{item.id}</p><h3>{ar?item.service.name_ar||item.service.name:item.service.name}</h3><div className={s.provider}><UserRound size={15}/><span>{item.provider.name || "\u2014"}</span></div><div className={s.schedule}><div><CalendarDays size={16}/><span>{item.scheduled.date || "\u2014"}</span></div><div><Clock3 size={16}/><span>{item.scheduled.booking_slot || "\u2014"}</span></div></div><div className={s.total}><span>{ar?"\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a":"Visit total"}</span><strong>{currency(item.amount.total_halalas,item.amount.currency,ar)}</strong></div><Link className={s.view} href={prefix+"/dashboard/home-visits/"+item.id}>{ar?"\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0632\u064a\u0627\u0631\u0629":"Visit details"}<ArrowUpRight size={17}/></Link></div></article>
        ))}
      </div>
      {!data.items.length ? (
        <div className={s.empty}><HousePlus size={30}/><h2>No visits to show</h2><p>Try a different search or date range to find your visit.</p></div>
      ) : null}
<nav className={s.pagination} aria-label="Home visit pages"><span>{data.total} visits &middot; Page {data.page}</span><div>{data.page>1&&<Link href={pageHref(data.page-1)}>Previous</Link>}<span aria-current="page">{data.page}</span>{data.hasMore&&<Link href={pageHref(data.page+1)}>Next</Link>}</div></nav>
    </div>
  );
}
