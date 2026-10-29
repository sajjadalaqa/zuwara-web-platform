import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

const pageMetadata:Metadata={title:"Book an appointment",description:"Start a Zuwara consultation or therapy booking journey.",robots:{index:false,follow:true}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default function Book(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("Booking")} title={uiText("Choose the care journey that fits.")} description={uiText("Start with scheduled consultation, request timely care, or explore a structured therapy plan.")} action={false}/><section className="content-section"><div className="container"><div className="login-choices"><article className="login-choice"><Icon name="calendar"/><h2>{uiText("Scheduled consultation")}</h2><p>{uiText("Browse verified profiles, compare duration options, and choose date-based availability.")}</p><Link href="/healthcare/doctors" className="text-link">{uiText("Find a consultant")}{" "}<Icon name="arrow" size={17}/></Link></article><article className="login-choice"><Icon name="video"/><h2>{uiText("Instant consultation")}</h2><p>{uiText("Understand how timely public and private consultation requests work.")}</p><Link href="/services/instant-consultations" className="text-link">{uiText("Explore instant care")}{" "}<Icon name="arrow" size={17}/></Link></article><article className="login-choice"><Icon name="heart"/><h2>{uiText("Therapy sessions")}</h2><p>{uiText("Review plan-based care, session durations, and coordinated booking information.")}</p><Link href="/services/therapy-sessions" className="text-link">{uiText("Explore therapy plans")}{" "}<Icon name="arrow" size={17}/></Link></article></div><p className="notice access-note">{uiText("Live availability is read from Zuwara. Sign in before completing a secure booking and payment.")}</p></div></section></>}
