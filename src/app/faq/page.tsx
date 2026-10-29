import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { PageHero } from "@/components/PageHero";

const pageMetadata:Metadata={title:"Frequently asked questions",description:"Answers to common questions about Zuwara appointments, consultations, payment and home services.",alternates:{canonical:"/faq"}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

const faqs=[["How do I choose a consultant?","Use specialty, classification, duration and date filters, then review the consultant profile before booking."],["Can I book for a family member?","The current Zuwara product supports managed patient or dependant profiles. Final website behavior will connect to the same approved APIs."],["When is a payment considered confirmed?","The backend verifies payment status with the payment provider. A redirect or successful screen alone does not mark a booking as paid."],["Are home services and consultations the same booking?","No. Healthcare appointments and home-service bookings are separate domains with their own providers, schedules and status journeys."],["Can I use the website in Arabic?","The architecture and design are prepared for Arabic and RTL. Full reviewed Arabic content is required before publication."]];
export default function Faq(){
  const uiText = useUiText();return <><JsonLd data={{"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(([question,answer])=>({"@type":"Question",name:question,acceptedAnswer:{"@type":"Answer",text:answer}}))}}/><PageHero eyebrow={uiText("Help center")} title={uiText("Questions, answered clearly.")} description={uiText("Understand appointments, payments, consultations and services before you begin.")}/><section className="content-section"><div className="container faq-page-layout"><aside><span className="eyebrow">{uiText("Browse answers")}</span><h2>{uiText("Support without the guesswork.")}</h2><p>{uiText("Can’t find what you need? The Zuwara team can direct your question to the appropriate support journey.")}</p></aside><div className="faq-list">{faqs.map(([q,a],index)=><details key={uiText(q)} open={index===0}><summary>{uiText(q)}<span>+</span></summary><p>{uiText(a)}</p></details>)}</div></div></section></>}
