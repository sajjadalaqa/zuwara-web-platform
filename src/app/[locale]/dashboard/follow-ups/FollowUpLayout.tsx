import { useUiText } from "@/i18n/use-ui-text";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import type { ReactNode } from "react";
import s from "./follow-ups.module.css";
export default function FollowUpLayout({ ar, detail=false, children }: {ar:boolean;detail?:boolean;children:ReactNode}) {
  const uiText = useUiText();
 const prefix=ar?"/ar":"";
 const links=[[uiText("Therapy"),"\u0627\u0644\u0639\u0644\u0627\u062c","therapy"],[uiText("Rescheduling"),"\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629","rescheduling"],["Follow-ups","\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a","follow-ups"],[uiText("Benefits"),"\u0627\u0644\u0645\u0632\u0627\u064a\u0627","benefits"],[uiText("Home visits"),"\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629","home-visits"]];
 return <div className={s.page} dir={ar?"rtl":"ltr"}><header className={s.header}><span className={s.headerIcon}><Stethoscope size={25}/></span><div><h1>{detail?(ar?"\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629":"Follow-up details"):(ar?"\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a":"Follow-ups")}</h1><p>{ar?"\u0645\u062a\u0627\u0628\u0639\u0629 \u0631\u0639\u0627\u064a\u062a\u0643\u060c \u062e\u0637\u0648\u0629 \u0628\u062e\u0637\u0648\u0629.":"Your care continues here. Keep your follow-up times and clinical notes close."}</p></div></header><nav className={s.nav} aria-label={ar?"\u0627\u0644\u0631\u0639\u0627\u064a\u0629":uiText("Care journeys")}>{links.map(([en,arabic,path])=><Link key={path} href={prefix+"/dashboard/"+path} aria-current={path==="follow-ups"?"page":undefined}>{ar?arabic:en}</Link>)}</nav>{children}</div>
}
