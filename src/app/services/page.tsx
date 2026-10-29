import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/data/site";

const pageMetadata: Metadata = { title: "Healthcare and home services", description: "Explore virtual consultations, instant care, therapy sessions and selected home healthcare services available through Zuwara.", alternates: { canonical: "/services" } };
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


export default function ServicesPage(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("Explore care")} title={uiText("Services designed around the way you live.")} description={uiText("Compare consultation, therapy and selected home-service journeys before continuing to the Zuwara booking experience.")}/><section className="content-section"><div className="container"><div className="listing-toolbar"><div className="category-pills"><span>{uiText("All services")}</span><span>{uiText("Consultations")}</span><span>{uiText("Home care")}</span><span>{uiText("Diagnostics")}</span><span>{uiText("Wellness")}</span></div></div><div className="service-grid">{services.map((service,index)=><ServiceCard key={service.slug} service={service} index={index}/>)}</div></div></section></>}
