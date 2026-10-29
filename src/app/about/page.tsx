import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

const pageMetadata:Metadata={title:"About Zuwara",description:"Learn how Zuwara connects consultation, therapy and selected home healthcare services into clearer patient journeys.",alternates:{canonical:"/about"}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default function About(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("About Zuwara")} title={uiText("Healthcare should feel connected, not complicated.")} description={uiText("Zuwara is building a clearer bridge between patients, consultants and selected home healthcare services.")}/><section className="content-section"><div className="container split"><div className="image-collage"><Image className="collage-main" src="/images/care-3.png" alt={uiText("Healthcare professional speaking with a patient")} width={520} height={520}/><Image className="collage-small" src="/images/care-1.png" alt={uiText("Clinical care environment")} width={250} height={250}/></div><article className="prose"><span className="eyebrow">{uiText("Our direction")}</span><h2>{uiText("Technology that supports the care relationship.")}</h2><p>{uiText("Our product is designed to remove avoidable friction: finding the right professional, understanding availability, managing a dependant, confirming payment and returning to reports or follow-up information.")}</p><h3>{uiText("What guides the product")}</h3><ul><li>{uiText("Clarity before conversion")}</li><li>{uiText("Privacy and secure handling of sensitive information")}</li><li>{uiText("Arabic and English experiences")}</li><li>{uiText("Accessible care journeys across devices")}</li><li>{uiText("Reliable payment and appointment state")}</li></ul><Link href="/services" className="button button-primary">{uiText("Explore services")}{" "}<Icon name="arrow" size={18}/></Link></article></div></section></>}
