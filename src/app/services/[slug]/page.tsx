import { getUiText } from "@/i18n/server-ui-text";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";
import { services, SITE_URL } from "@/data/site";

export function generateStaticParams(){return services.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const service=services.find(item=>item.slug===slug);if(!service)return{};return{title:service.title,description:service.description,alternates:{canonical:`/services/${slug}`},openGraph:{title:service.title,description:service.short,url:`/services/${slug}`}}}

export default async function ServiceDetail({params}:{params:Promise<{slug:string}>}){
  const uiText = await getUiText();const {slug}=await params;const service=services.find(item=>item.slug===slug);if(!service)notFound();return <><JsonLd data={{"@context":"https://schema.org","@type":"Service",name:service.title,description:service.description,provider:{"@type":"Organization",name:"Zuwara",url:SITE_URL},url:`${SITE_URL}/services/${service.slug}`}}/><PageHero eyebrow={uiText(service.category)} title={uiText(service.title)} description={uiText(service.description)}/><section className="content-section"><div className="container content-grid"><article className="prose"><h2>{uiText("A clearer way to start")}</h2><p>{uiText(service.short)} {uiText("Zuwara brings important preparation, availability and booking information together so patients can understand the next step before they commit.")}</p><h3>{uiText("How the journey works")}</h3><ol><li>{uiText("Review the service information and who it is designed for.")}</li><li>{uiText("Choose the appropriate profile, duration or provider where applicable.")}</li><li>{uiText("Sign in securely and confirm the patient or dependant.")}</li><li>{uiText("Review availability, price and payment details.")}</li><li>{uiText("Track the booking and follow-up from the Zuwara experience.")}</li></ol><div className="notice">{uiText("Service availability, pricing and eligibility will be loaded from verified Zuwara APIs when this presentation template enters the integration phase.")}</div></article><aside className="info-panel"><span className="eyebrow">{uiText("At a glance")}</span><h3>{uiText("What this journey supports")}</h3><ul>{service.highlights.map(item=><li key={item}><Icon name="check" size={20}/>{uiText(item)}</li>)}</ul><Link href="/book" className="button button-primary">{uiText("Continue to booking")}{" "}<Icon name="arrow" size={18}/></Link></aside></div></section></>}
