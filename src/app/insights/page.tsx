import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { articles } from "@/data/site";

export const metadata:Metadata={title:"Health insights",description:"Clear patient guides for consultations, care choices and managing family health journeys.",alternates:{canonical:"/insights"}};
export default function Insights(){return <><PageHero eyebrow="Health insights" title="Useful guidance without the noise." description="Practical articles prepared for an editorial workflow with medically reviewed, bilingual content."/><section className="content-section"><div className="container article-grid">{articles.map((article,i)=><article className={`article-card article-${i+1}`} key={article.slug}><span>{article.category}</span><h2>{article.title}</h2><p>{article.excerpt}</p><div><small>{article.read}</small><Link href={`/insights/${article.slug}`}><Icon name="arrow"/></Link></div></article>)}</div></section></>}
