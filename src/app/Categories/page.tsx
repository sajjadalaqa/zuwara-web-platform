import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

const pageMetadata: Metadata = { title: "How It Works", description: "Understand the separate healthcare and home-service journeys within Zuwara.", alternates: { canonical: "/how-it-works" } };
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


export default function HowItWorksPage(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("How Zuwara works")} title={uiText("One platform. Two focused journeys.")} description={uiText("Discovery feels connected, while healthcare and Zuwara Visit retain their own booking, payment, wallet, and operational rules.")} action={false}/><section className="content-section"><div className="container how-grid"><article><Icon name="heart"/><span>{uiText("Healthcare")}</span><h2>{uiText("Find care and confirm an appointment.")}</h2><ol><li>{uiText("Choose a specialty or consultant")}</li><li>{uiText("Review duration and availability")}</li><li>{uiText("Confirm the patient and payment")}</li><li>{uiText("Continue to consultation and follow-up")}</li></ol><Link href="/healthcare" className="text-link">{uiText("Explore healthcare")}{" "}<Icon name="arrow" size={17}/></Link></article><article><Icon name="home"/><span>{uiText("Home services")}</span><h2>{uiText("Choose a service and track its progress.")}</h2><ol><li>{uiText("Browse a category or search")}</li><li>{uiText("Refine by location and provider")}</li><li>{uiText("Confirm the booking details")}</li><li>{uiText("Track, complete, and review")}</li></ol><Link href="/home-services" className="text-link">{uiText("Explore home services")}{" "}<Icon name="arrow" size={17}/></Link></article></div></section></>}
