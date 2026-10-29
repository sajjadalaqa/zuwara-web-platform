import { healthcareText } from "@/i18n/healthcare-text";
import { useLocale } from "next-intl";
import { useUiText } from "@/i18n/use-ui-text";
import { Link } from "@/i18n/navigation";
import type { ZuwaraCategory } from "@/lib/api/zuwara/types";

export type HealthcareFilterValues = {
  query?: string;
  category?: string;
  duration?: string;
  date?: string;
  consultationType?: string;
  gender?: string;
  availableToday?: string;
  sort?: string;
};

export function HealthcareFilters({ categories, values }: { categories: ZuwaraCategory[]; values: HealthcareFilterValues }) {
  const displayLocale = useLocale();
  const uiText = useUiText();
  return <form action={`${displayLocale === "ar" ? "/ar" : ""}/healthcare/doctors`} method="get" className="healthcare-filters">
    <div className="filter-title"><div><span>{uiText("Refine your search")}</span><strong>{uiText("Consultant filters")}</strong></div><Link href="/healthcare/doctors">{uiText("Reset")}</Link></div>
    <label className="filter-full"><span>{uiText("Name, specialty or classification")}</span><input type="search" name="query" defaultValue={values.query} placeholder={uiText("Search in English or Arabic")} autoComplete="off"/></label>
    <label><span>{uiText("Specialty")}</span><select name="category" defaultValue={values.category ?? ""}><option value="">{uiText("All specialties")}</option>{categories.map(item=><option key={item.id} value={item.id}>{healthcareText(item, "title", displayLocale)}</option>)}</select></label>
    <label><span>{uiText("Duration")}</span><select name="duration" defaultValue={values.duration ?? ""}><option value="">{uiText("All durations")}</option>{[15,30,45,60].map(value=><option value={value} key={value}>{value} {uiText("minutes")}</option>)}</select></label>
    <label><span>{uiText("Preferred date")}</span><input type="date" name="date" defaultValue={values.date}/></label>
    <label><span>{uiText("Consultation type")}</span><select name="consultation_type" defaultValue={values.consultationType ?? ""}><option value="">{uiText("All types")}</option><option value="online">{uiText("Online consultation")}</option><option value="chat">{uiText("Chat")}</option><option value="audio">{uiText("Audio")}</option><option value="video">{uiText("Video")}</option><option value="clinic">{uiText("In person")}</option></select></label>
    <label><span>{uiText("Consultant gender")}</span><select name="gender" defaultValue={values.gender ?? ""}><option value="">{uiText("Any gender")}</option><option value="1">{uiText("Male")}</option><option value="0">{uiText("Female")}</option></select></label>
    <label><span>{uiText("Sort")}</span><select name="sort" defaultValue={values.sort ?? ""}><option value="">{uiText("Recommended")}</option><option value="3">{uiText("Highest rated")}</option><option value="1">{uiText("Price: low to high")}</option><option value="2">{uiText("Price: high to low")}</option></select></label>
    <label className="filter-check"><input type="checkbox" name="available_today" value="1" defaultChecked={values.availableToday === "1"}/><span>{uiText("Only show consultants with an available slot")}</span></label>
    <button type="submit" className="button button-primary filter-submit">{uiText("Apply filters")}</button>
  </form>;
}
