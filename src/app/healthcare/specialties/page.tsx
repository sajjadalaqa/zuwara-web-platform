import { healthcareText } from "@/i18n/healthcare-text";
import { getLocale } from "next-intl/server";
import { getUiText } from "@/i18n/server-ui-text";
import type { Metadata } from "next";
import { SpecialtyImage } from "@/components/healthcare/SpecialtyImage";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
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
  return <><section className="specialty-index-hero"><div className="container"><Breadcrumbs items={[{label:uiText("Home"),href:"/"},{label:uiText("Healthcare"),href:"/healthcare"},{label:uiText("Specialties")}]}/><span className="eyebrow">{uiText("Healthcare specialties")}</span><h1>{uiText("Start with the area of care.")}</h1><p>{uiText("Explore areas of care and connect with a consultant who understands your needs.")}</p></div></section><section className="content-section"><div className="container">{data.categories.length?<div className="specialty-index-grid">{data.categories.map((item,index)=><Link key={item.id} href={`/healthcare/specialties/${specialtySlug(healthcareText(item, "title", displayLocale),item.id)}`}><span className="specialty-number">{String(index+1).padStart(2,"0")}</span><div className="specialty-index-icon"><SpecialtyImage src={item.imageUrl}/></div><div><h2>{healthcareText(item, "title", displayLocale)}</h2></div><Icon name="arrow"/></Link>)}</div>:<div className="directory-empty"><h2>{uiText("Specialties are temporarily unavailable.")}</h2><Link href="/healthcare" className="button button-secondary">{uiText("Return to healthcare")}</Link></div>}</div></section></>;
}
