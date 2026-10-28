import Link from "next/link";
import { getLocale } from "next-intl/server";
import { homeHistory } from "@/lib/api/d4h/history";
import { currency } from "../_care/ui";
import { HousePlus, Search, SlidersHorizontal, CalendarDays, Clock3, UserRound, ArrowUpRight, History, ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
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
  const t = (en: string, arabic: string) => ar ? arabic : en;
  const filtered = query.size > 0;
  const statusLabels: Record<string, string> = {
    waiting: t("Awaiting confirmation", "\u0628\u0627\u0646\u062a\u0638\u0627\u0631 \u0627\u0644\u062a\u0623\u0643\u064a\u062f"),
    pending: t("Pending", "\u0642\u064a\u062f \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631"),
    accept: t("Confirmed", "\u0645\u0624\u0643\u062f\u0629"),
    accepted: t("Confirmed", "\u0645\u0624\u0643\u062f\u0629"),
    completed: t("Completed", "\u0645\u0643\u062a\u0645\u0644\u0629"),
    cancelled: t("Cancelled", "\u0645\u0644\u063a\u0627\u0629"),
    rejected: t("Declined", "\u0645\u0631\u0641\u0648\u0636\u0629"),
  };
  const journeys = [
    [t("Home visits", "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629"), "home-visits"],
    [t("Therapy", "\u0627\u0644\u0639\u0644\u0627\u062c"), "therapy"],
    [t("Rescheduling", "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629"), "rescheduling"],
    [t("Follow-ups", "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a"), "follow-ups"],
    [t("Benefits", "\u0627\u0644\u0645\u0632\u0627\u064a\u0627"), "benefits"],
  ];
  return (
    <div className={s.page} dir={ar ? "rtl" : "ltr"}>
      <header className={s.header}>
        <div className={s.heroCopy}>
          <span className={s.heroEyebrow}><HousePlus size={17} aria-hidden="true"/>{t("YOUR CARE, AT HOME", "\u0631\u0639\u0627\u064a\u062a\u0643 \u0641\u064a \u0645\u0646\u0632\u0644\u0643")}</span>
          <h1>{t("Home visits", "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629")}</h1>
          <p>{t("A little closer to care. Manage your visits and find the right service for your home.", "\u062a\u0627\u0628\u0639 \u0632\u064a\u0627\u0631\u0627\u062a\u0643 \u0648\u0627\u0628\u062d\u062b \u0639\u0646 \u0627\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u0645\u0646\u0627\u0633\u0628\u0629 \u0644\u0645\u0646\u0632\u0644\u0643.")}</p>
        </div>
        <div className={s.heroAction}>
          <Link href={prefix + "/provider"} className={s.book}><span className={s.bookIcon}><HousePlus size={21}/></span><span>{t("Book a home visit", "\u0627\u062d\u062c\u0632 \u0632\u064a\u0627\u0631\u0629 \u0645\u0646\u0632\u0644\u064a\u0629")}</span><ArrowUpRight size={19} className={s.directional}/></Link>
          <span>{t("Explore providers & home services", "\u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u0642\u062f\u0645\u064a \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629")}</span>
        </div>
        <HousePlus className={s.heroArt} size={190} strokeWidth={.65} aria-hidden="true"/>
      </header>
      <nav className={s.nav} aria-label={t("Care journeys", "\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0631\u0639\u0627\u064a\u0629")}>
        {journeys.map(([label, path]) => <Link key={path} href={prefix + "/dashboard/" + path} aria-current={path === "home-visits" ? "page" : undefined}>{path === "home-visits" && <HousePlus size={17}/>} {label}</Link>)}
      </nav>
      <section className={s.history} aria-labelledby="visits-heading">
        <div className={s.sectionHead}>
          <div><span className={s.sectionIcon}><History size={20}/></span><div><h2 id="visits-heading">{t("Your visit history", "\u0633\u062c\u0644 \u0632\u064a\u0627\u0631\u0627\u062a\u0643")}<span className={s.count}>{data.total}</span></h2><p>{t("All your home care, thoughtfully organized.", "\u0643\u0644 \u0631\u0639\u0627\u064a\u062a\u0643 \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629 \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f.")}</p></div></div>
        </div>
        <form className={s.filters}>
          {query.has("status") && <input type="hidden" name="status" value={query.get("status")!}/>}
          <label className={s.searchLabel}>{t("Search visits", "\u0627\u0628\u062d\u062b \u0641\u064a \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a")}<span className={s.searchField}><Search size={18}/><input name="q" defaultValue={sp.q} placeholder={t("Service or provider name...", "\u0627\u0633\u0645 \u0627\u0644\u062e\u062f\u0645\u0629 \u0623\u0648 \u0645\u0642\u062f\u0645\u0647\u0627...")}/></span></label>
          <label>{t("From date", "\u0645\u0646 \u062a\u0627\u0631\u064a\u062e")}<input type="date" name="from_date" defaultValue={sp.from_date}/></label>
          <label>{t("To date", "\u0625\u0644\u0649 \u062a\u0627\u0631\u064a\u062e")}<input type="date" name="to_date" defaultValue={sp.to_date}/></label>
          <button type="submit"><SlidersHorizontal size={17}/>{t("Apply filters", "\u062a\u0637\u0628\u064a\u0642")}</button>
          {filtered && <Link className={s.clear} href={prefix + "/dashboard/home-visits"}>{t("Clear filters", "\u0645\u0633\u062d \u0627\u0644\u062a\u0635\u0641\u064a\u0629")}</Link>}
        </form>
        <div className={s.grid}>
          {data.items.map(item => <article className={s.card} data-status={item.status.toLowerCase()} key={item.id}>
            <div className={s.cardHead}><span className={s.cardIcon}><HousePlus size={23}/></span><span className={s.reference}>{t("HOME VISIT", "\u0632\u064a\u0627\u0631\u0629 \u0645\u0646\u0632\u0644\u064a\u0629")} <b>#{item.id}</b></span><span className={s.badge}><span className={s.dot}/>{statusLabels[item.status.toLowerCase()] || item.status.replace(/_/g, " ")}</span></div>
            <div className={s.cardBody}>
              <h3>{ar ? item.service.name_ar || item.service.name : item.service.name}</h3>
              <div className={s.provider}><UserRound size={16}/><span>{item.provider.name || "\u2014"}</span></div>
              <div className={s.schedule}>
                <div><CalendarDays size={18}/><span><small>{t("Visit date", "\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0632\u064a\u0627\u0631\u0629")}</small><b>{item.scheduled.date || "\u2014"}</b></span></div>
                <div><Clock3 size={18}/><span><small>{t("Time slot", "\u0648\u0642\u062a \u0627\u0644\u0632\u064a\u0627\u0631\u0629")}</small><b>{item.scheduled.booking_slot || "\u2014"}</b></span></div>
              </div>
              {item.address && <p className={s.address}><MapPin size={15}/><span>{item.address}</span></p>}
              <div className={s.cardFoot}><div className={s.total}><span>{t("Visit total", "\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u0632\u064a\u0627\u0631\u0629")}</span><strong>{currency(item.amount.total_halalas, item.amount.currency, ar)}</strong></div><Link className={s.view} href={prefix + "/dashboard/home-visits/" + item.id}>{t("View details", "\u0639\u0631\u0636 \u0627\u0644\u062a\u0641\u0627\u0635\u064a\u0644")}<ArrowRight size={16} className={s.directional}/></Link></div>
            </div>
          </article>)}
        </div>
        {!data.items.length && <div className={s.empty}><span className={s.emptyIcon}><HousePlus size={32}/></span><h2>{t("No visits to show", "\u0644\u0627 \u062a\u0648\u062c\u062f \u0632\u064a\u0627\u0631\u0627\u062a")}</h2><p>{t("Try adjusting your filters, or explore home services to arrange your next visit.", "\u062c\u0631\u0628 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u062a\u0635\u0641\u064a\u0629 \u0623\u0648 \u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629.")}</p><Link href={prefix + "/provider"} className={s.view}>{t("Explore home services", "\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u062e\u062f\u0645\u0627\u062a")}<ArrowUpRight size={17}/></Link></div>}
        <nav className={s.pagination} aria-label={t("Home visit pages", "\u0635\u0641\u062d\u0627\u062a \u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a")}><span>{data.total} {t("visits", "\u0632\u064a\u0627\u0631\u0627\u062a")}<span className={s.separator}>/</span>{t("Page", "\u0627\u0644\u0635\u0641\u062d\u0629")} {data.page}</span><div>{data.page > 1 && <Link href={pageHref(data.page - 1)}><ChevronLeft size={16} className={s.directional}/>{t("Previous", "\u0627\u0644\u0633\u0627\u0628\u0642")}</Link>}<span aria-current="page">{data.page}</span>{data.hasMore && <Link href={pageHref(data.page + 1)}>{t("Next", "\u0627\u0644\u062a\u0627\u0644\u064a")}<ChevronRight size={16} className={s.directional}/></Link>}</div></nav>
      </section>
    </div>
  );
}
