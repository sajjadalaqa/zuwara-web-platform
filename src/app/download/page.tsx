import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";

const pageMetadata:Metadata={title:"Download the Zuwara app",description:"Manage Zuwara appointments, family profiles, reports and care journeys from the patient mobile application.",alternates:{canonical:"/download"}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default function Download(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("Zuwara mobile")} title={uiText("Keep your care journey close.")} description={uiText("The Zuwara patient app brings appointments, family profiles, wallet activity, reports and conversations into one experience.")}/><section className="content-section"><div className="container app-showcase"><div className="app-copy"><span className="eyebrow eyebrow-light">{uiText("App stores")}</span><h2>{uiText("One place to manage the next step.")}</h2><p>{uiText("Verified App Store and Google Play links will be added before production publication.")}</p><div className="notice notice-dark">{uiText("Store buttons are intentionally not linked in this design build to avoid publishing unverified destinations.")}</div></div><div className="phones"><Image src="/images/app-phone-1.png" alt={uiText("Zuwara mobile app")} width={260} height={540}/><Image src="/images/app-phone-2.png" alt={uiText("Zuwara appointment experience")} width={260} height={540}/></div></div></section></>}
