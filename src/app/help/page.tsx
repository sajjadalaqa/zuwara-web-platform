import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

const pageMetadata: Metadata = { title: "Help & Support", description: "Find guidance for Zuwara healthcare and Zuwara Visit home-service journeys.", alternates: { canonical: "/help" } };
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}


export default function HelpPage(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("Zuwara support")} title={uiText("Help for every journey.")} description={uiText("Start with the area that matches your booking. Healthcare and home services remain separate operational systems.")} action={false}/><section className="content-section"><div className="container support-grid"><article><Icon name="heart"/><h2>{uiText("Healthcare support")}</h2><p>{uiText("Questions about consultants, appointments, therapy, payment confirmation, reports, or prescriptions.")}</p><Link href="/contact" className="button button-primary">{uiText("Contact healthcare support")}</Link></article><article><Icon name="home"/><h2>{uiText("Home-service support")}</h2><p>{uiText("Questions about categories, providers, locations, service bookings, requests, tracking, or reviews.")}</p><Link href="/contact" className="button button-secondary">{uiText("Contact home-service support")}</Link></article></div></section></>}
