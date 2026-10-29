import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Flower2, HeartHandshake, Leaf, UsersRound, Sunrise, ShieldCheck, Compass, Waves, Sparkles, CloudSun, Sprout, Mountain, Layers3, ArrowUpRight, Check, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { careList, type Plan } from "@/lib/api/zuwara/care";
import { bilingual } from "../_care/ui";
import s from "./therapy.module.css";
function planVisual(plan: Plan) {
 const title=(plan.title?.en || "").toLowerCase();
 const themes=[[/grief|loss/,HeartHandshake],[/self.esteem|confidence/,Sunrise],[/relationship|family/,UsersRound],[/phobia|avoidance/,Compass],[/health anxiety/,ShieldCheck],[/anger|emotion/,Waves],[/burnout|work/,Leaf],[/trauma|post.traumatic/,Mountain],[/social anxiety/,CloudSun],[/obsessive|compulsive/,Sparkles],[/stress|adjustment/,Sprout]] as const;
 return themes.find(([pattern])=>pattern.test(title))?.[1] || Flower2;
}
export default async function TherapyPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const uiText = await getUiText();
 const [locale, sp] = await Promise.all([getLocale(), searchParams]), ar=locale==="ar", prefix=ar?"/ar":"";
 const data=await careList<Plan>("/therapy-plans",Number(sp.page)||1);
 const links=[[uiText("Therapy"),"\u0627\u0644\u0639\u0644\u0627\u062c","therapy"],[uiText("Rescheduling"),"\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629","rescheduling"],["Follow-ups","\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a","follow-ups"],[uiText("Benefits"),"\u0627\u0644\u0645\u0632\u0627\u064a\u0627","benefits"],[uiText("Home visits"),"\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629","home-visits"]];
 return <div className={s.page} dir={ar?"rtl":"ltr"}>
 <header className={s.header}><span className={s.headerIcon}><Flower2 size={25}/></span><div><h1>{ar?"\u062e\u0637\u0637 \u0627\u0644\u0639\u0644\u0627\u062c":"Therapy plans"}</h1><p>{ar?"\u0627\u062e\u062a\u0631 \u062e\u0637\u0629 \u0648\u0627\u0633\u062a\u0634\u0627\u0631\u064a\u0627\u064b \u0648\u0645\u0648\u0627\u0639\u064a\u062f \u062c\u0644\u0633\u0627\u062a\u0643.":"Find your plan, choose your consultant and take the next step at your pace."}</p></div></header>
 <nav className={s.nav} aria-label={ar?"\u0627\u0644\u0631\u0639\u0627\u064a\u0629":uiText("Care journeys")}>{links.map(([en,arabic,path])=><Link key={path} href={prefix+"/dashboard/"+path} aria-current={path==="therapy"?"page":undefined}>{ar?arabic:en}</Link>)}</nav>
 <div className={s.intro}><div><h2>{ar?"\u0627\u0644\u062e\u0637\u0637 \u0627\u0644\u0645\u062a\u0627\u062d\u0629":uiText("Explore therapy plans")}</h2><p>{ar?"\u0627\u0633\u062a\u0643\u0634\u0641 \u062a\u0641\u0627\u0635\u064a\u0644 \u0643\u0644 \u062e\u0637\u0629 \u0648\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629.":"Explore each plan and find session times that work for you."}</p></div><span className={s.introIcon}><CalendarDays size={21}/></span></div>
 <div className={s.grid}>{data.items.map((plan,index)=>{const PlanIcon=planVisual(plan);return <article className={s.card} data-tone={index%4} key={plan.id}>
 <div className={s.cardTop}><span className={s.planIcon}><PlanIcon size={27} strokeWidth={1.6}/></span>{plan.sessions_recommended&&<span className={s.badge}><Check size={13}/>{ar?"\u062c\u0644\u0633\u0627\u062a \u0645\u0648\u0635\u0649 \u0628\u0647\u0627":"Recommended sessions"}</span>}</div>
 <h3>{bilingual(plan.title,ar)}</h3>
 <div className={s.sessions}><Layers3 size={18}/><span>{ar?"\u0627\u0644\u062c\u0644\u0633\u0627\u062a":uiText("Sessions")}</span><strong>{plan.total_sessions}</strong></div>
 {!plan.sessions_recommended&&<p className={s.note}>{ar?"\u0627\u0644\u062c\u0644\u0633\u0627\u062a \u0627\u0644\u0645\u0648\u0635\u0649 \u0628\u0647\u0627: \u0644\u0627":"Recommended sessions: No"}</p>}
 <Link className={s.action} href={prefix+"/dashboard/therapy/"+plan.id}>{ar?"\u0639\u0631\u0636 \u0627\u0644\u062e\u0637\u0629 \u0648\u0627\u0644\u062a\u0648\u0627\u0641\u0631":"View plan & availability"}<ArrowUpRight size={17}/></Link>
 </article>})}</div>
 {!data.items.length&&<div className={s.empty}><Flower2 size={30}/><h2>{ar?"\u0644\u0627 \u062a\u0648\u062c\u062f \u062e\u0637 \u062d\u0627\u0644\u064a\u0627\u064b":"No plans available yet"}</h2><p>{ar?"\u0633\u062a\u0638\u0647\u0631 \u0627\u0644\u062e\u0637 \u0627\u0644\u0645\u062a\u0627\u062d\u0629 \u0647\u0646\u0627.":"Available therapy plans will appear here."}</p></div>}
 <nav className={s.pagination} aria-label={ar?"\u0627\u0644\u0635\u0641\u062d\u0627\u062a":"Therapy plan pages"}><div className={s.results}><strong>{data.total}</strong> {ar?"\u062e\u0637\u0629":"plans"}<span className={s.separator}/>{ar?"\u0627\u0644\u0635\u0641\u062d\u0629":uiText("Page")} {data.page}</div><div className={s.pageControls}>{data.page>1?<Link href={prefix+"/dashboard/therapy?page="+(data.page-1)}><ChevronLeft size={16}/>{ar?"\u0627\u0644\u0633\u0627\u0628\u0642":uiText("Previous")}</Link>:<span aria-disabled="true"><ChevronLeft size={16}/>{ar?"\u0627\u0644\u0633\u0627\u0628\u0642":uiText("Previous")}</span>}<span className={s.currentPage} aria-current="page">{data.page}</span>{data.hasMore?<Link href={prefix+"/dashboard/therapy?page="+(data.page+1)}>{ar?"\u0627\u0644\u062a\u0627\u0644\u064a":uiText("Next")}<ChevronRight size={16}/></Link>:<span aria-disabled="true">{ar?"\u0627\u0644\u062a\u0627\u0644\u064a":uiText("Next")}<ChevronRight size={16}/></span>}</div></nav>
 </div>;
}
