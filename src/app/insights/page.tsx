import { getUiText } from "@/i18n/server-ui-text";
import { useUiText } from "@/i18n/use-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { articles } from "@/data/site";

const pageMetadata:Metadata={title:"Health insights",description:"Clear patient guides for consultations, care choices and managing family health journeys.",alternates:{canonical:"/insights"}};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default function Insights(){
  const uiText = useUiText();return <><PageHero eyebrow={uiText("Health insights")} title={uiText("Useful guidance without the noise.")} description={uiText("Practical articles prepared for an editorial workflow with medically reviewed, bilingual content.")}/><section className="content-section"><div className="container article-grid">{articles.map((article,i)=><article className={`article-card article-${i+1}`} key={article.slug}><span>{uiText(article.category)}</span><h2>{uiText(article.title)}</h2><p>{uiText(article.excerpt)}</p><div><small>{uiText(article.read)}</small><Link href={`/insights/${article.slug}`}><Icon name="arrow"/></Link></div></article>)}</div></section></>}
