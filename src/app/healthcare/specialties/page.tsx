import { healthcareText } from "@/i18n/healthcare-text";
import { getLocale } from "next-intl/server";
import { getUiText } from "@/i18n/server-ui-text";
import type { Metadata } from "next";
import { Stethoscope } from "lucide-react";
import SpecialtyExplorer from "@/components/discovery/SpecialtyExplorer";
import styles from "@/components/discovery/Discovery.module.css";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { specialtySlug } from "@/lib/api/zuwara/slugs";

const pageMetadata: Metadata = { title: "Healthcare Specialties", description: "Browse active Zuwara healthcare specialties and find consultants in each category.", alternates: { canonical: "/healthcare/specialties" } };
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


export default async function SpecialtiesPage(){
  const displayLocale = await getLocale();
  const uiText = await getUiText();
  const data=await getZuwaraHomeData();
  const ar = displayLocale === "ar";
  return <div className={styles.page}><div className="container">
    <section className={styles.hero}>
      <Breadcrumbs items={[{label:uiText("Home"),href:"/"},{label:uiText("Healthcare"),href:"/healthcare"},{label:uiText("Specialties")}]}/>
      <div className={styles.heroLayout}><div><span className={styles.eyebrow}><Stethoscope size={15} aria-hidden="true" />{uiText("Healthcare specialties")}</span>
        <h1 className={styles.title}>{uiText("Start with the area of care.")}</h1>
        <p className={styles.intro}>{uiText("Explore areas of care and connect with a consultant who understands your needs.")}</p>
      </div><span className={styles.heroIcon} aria-hidden="true"><Stethoscope size={46} strokeWidth={1.4} /></span></div>
    </section>
    {data.categories.length ? <SpecialtyExplorer items={data.categories.map(item=>({id:item.id,title:healthcareText(item,"title",displayLocale),imageUrl:item.imageUrl,href:"/healthcare/specialties/"+specialtySlug(healthcareText(item,"title",displayLocale),item.id)}))}
      labels={{title:uiText("Specialties"),hint:ar ? "اختر التخصص المناسب لك" : "Choose the right specialty for your needs",search:ar ? "ابحث عن تخصص" : "Search specialties",explore:ar ? "عرض الاستشاريين" : "Explore consultants",empty:ar ? "لا توجد نتائج" : "No specialties found",clear:ar ? "مسح البحث" : "Clear search"}} />
      : <div className={styles.empty}><h2>{uiText("Specialties are temporarily unavailable.")}</h2><Link href="/healthcare" className={styles.primary}>{uiText("Return to healthcare")}</Link></div>}
  </div></div>;
}
