import { getUiText } from "@/i18n/server-ui-text";
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { APP_STORE_URL, GOOGLE_PLAY_URL } from "@/data/site";

const pageMetadata:Metadata={title:"Download the Zuwara app",description:"Manage Zuwara appointments, family profiles, reports and care journeys from the patient mobile application.",alternates:{canonical:"/download"}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default async function Download(){
  const uiText = await getUiText();
  const ar = await getLocale() === "ar";
  return <>
    <PageHero eyebrow={uiText("Zuwara mobile")} title={uiText("Keep your care journey close.")} description={uiText("The Zuwara patient app brings appointments, family profiles, wallet activity, reports and conversations into one experience.")} />
    <section className="content-section"><div className="container app-showcase">
      <div className="app-copy">
        <span className="eyebrow eyebrow-light">{uiText("App stores")}</span>
        <h2>{uiText("One place to manage the next step.")}</h2>
        <p>{ar ? "حمّل تطبيق زوارة على جهاز آيفون أو أندرويد من المتجر المناسب لجهازك." : "Download the Zuwara patient app for iPhone or Android from your device’s app store."}</p>
        <div className="hero-actions" style={{ marginTop: 24 }}><a href={APP_STORE_URL} className="button button-light">App Store</a><a href={GOOGLE_PLAY_URL} className="button button-light">Google Play</a></div>
      </div>
      <div className="phones"><Image src="/images/app-phone-1.png" alt={uiText("Zuwara mobile app")} width={260} height={540}/><Image src="/images/app-phone-2.png" alt={uiText("Zuwara appointment experience")} width={260} height={540}/></div>
    </div></section>
  </>;
}
