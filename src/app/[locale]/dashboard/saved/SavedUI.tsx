import { useUiText } from "@/i18n/use-ui-text";
import Link from "next/link";
import { Heart, ArrowUpRight, Plus, Search, Hash } from "lucide-react";
import type { Favorite, Source } from "@/lib/api/patient-dashboard";
import { DoctorPhoto } from "@/components/healthcare/DoctorPhoto";
import Form from "../_patient/Form";
import s from "./saved.module.css";

export default function SavedUI({ rows, backend, prefix, base, ar }: { rows: Favorite[]; backend: Source; prefix: string; base: string; ar: boolean }) {
  const uiText = useUiText();
 const browse = prefix + (backend === "d4h" ? "/provider" : "/healthcare/doctors");
 return <>
  <nav className={s.tabs} aria-label={ar ? "\u0646\u0648\u0639 \u0627\u0644\u0631\u0639\u0627\u064a\u0629" : "Care type"}>
   <Link href={base+"?source=zuwara"} aria-current={backend==="zuwara" ? "page" : undefined}>{ar ? "\u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0627\u062a" : uiText("Consultations")}</Link>
   <Link href={base+"?source=d4h"} aria-current={backend==="d4h" ? "page" : undefined}>{ar ? "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629" : uiText("Home visits")}</Link>
  </nav>
  <section className={s.add}><div className={s.addIntro}><span className={s.addIcon}><Plus size={21}/></span><div><h2>{ar ? "\u062d\u0641\u0638 \u0628\u0627\u0644\u0645\u0631\u062c\u0639" : "Save a consultant by reference"}</h2><p>{ar ? "\u0627\u0633\u062a\u062e\u062f\u0645 \u0627\u0644\u0645\u0631\u062c\u0639 \u0627\u0644\u0638\u0627\u0647\u0631 \u0641\u064a \u0627\u0644\u0645\u0644\u0641." : "Already have a reference? Enter the number shown on the profile."}</p></div></div><Form op="favorite-add" source={backend} label={ar ? "\u062d\u0641\u0638" : "Save consultant"}><label>{ar ? "\u0627\u0644\u0645\u0631\u062c\u0639" : "Consultant reference"}<span className={s.referenceInput}><Hash size={17}/><input name="id" type="number" required step="1" placeholder={ar ? "\u0623\u062f\u062e\u0644 \u0631\u0642\u0645 \u0627\u0644\u0645\u0631\u062c\u0639" : "Enter reference number"}/></span></label></Form></section>
  <div className={s.collection}>
   <div className={s.sectionHead}><h2>{ar ? "\u0642\u0627\u0626\u0645\u062a\u0643 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629" : "Your saved collection"}</h2><Link href={browse}>{ar ? "\u0627\u0633\u062a\u0643\u0634\u0641" : "Explore consultants"}<ArrowUpRight size={16}/></Link></div>
   {rows.length ? <div className={s.grid}>{rows.map(r => {
    const name=ar ? r.name_ar || r.name : r.name;
    return <article className={s.card} key={r.id}>
     <div className={s.cardTop}><div className={s.photo}><DoctorPhoto src={r.photo || null} name={name} sizes="64px"/></div><span className={s.savedMark}><Heart size={17} fill="currentColor"/><span>{ar ? "\u0645\u062d\u0641\u0648\u0638" : "Saved"}</span></span></div>
     <div className={s.identity}><h3>{name}</h3><p className={s.reference}>{ar ? "\u0627\u0644\u0645\u0631\u062c\u0639" : uiText("Reference")} #{r.id}</p></div>
     <Link className={s.profile} href={prefix+(backend==="d4h"?"/provider/":"/healthcare/doctors/")+r.id}>{ar ? "\u0639\u0631\u0636 \u0627\u0644\u0645\u0644\u0641" : uiText("View profile")}<ArrowUpRight size={16}/></Link>
     <div className={s.remove}><Form op="favorite-remove" source={backend} id={r.id} label={ar ? "\u0625\u0632\u0627\u0644\u0629 \u0645\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0627\u062a" : "Remove from saved"}/></div>
    </article>;
   })}</div> : <div className={s.empty}><span><Heart size={30}/></span><h3>{ar ? "\u0642\u0627\u0626\u0645\u062a\u0643 \u062a\u0628\u062f\u0623 \u0647\u0646\u0627" : "Your favourites start here"}</h3><p>{ar ? "\u0627\u062d\u0641\u0638 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a\u064a\u0646 \u0644\u0644\u0639\u0648\u062f\u0629 \u0625\u0644\u064a\u0647\u0645 \u0628\u0633\u0647\u0648\u0644\u0629." : "Keep the consultants you would like to return to in one place."}</p><Link className={s.browse} href={browse}><Search size={16}/>{ar ? "\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a\u064a\u0646" : uiText("Find a consultant")}</Link></div>}
  </div>

 </>;
}
export { s };
