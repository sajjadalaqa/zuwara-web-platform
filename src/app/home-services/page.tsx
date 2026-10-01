import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { getD4hCategories } from "@/lib/api/d4h/catalog";

export const metadata: Metadata = {
  title: "Home Services",
  description: "Browse active Zuwara Home Services categories and continue to trusted providers and booking journeys at your location.",
  alternates: { canonical: "/home-services" },
};

export default async function HomeServicesPage() {
  const data = await getD4hCategories();
  return <>
    <PageHero eyebrow="Home Services By Zuwara" title="Trusted services, closer to home." description="Browse active service categories from D4H. Location and provider coverage determine the services genuinely available for booking." action={false}/>
    <section className="content-section"><div className="container gateway-layout">
      <aside className="gateway-aside"><span className="eyebrow">Home-service journeys</span><h2>Start with the help you need.</h2><nav><a href="#categories">Categories</a><a href="#journey">How booking works</a><a href="#request">Post a Request</a><Link href="/login">Sign in</Link></nav></aside>
      <div>
        <section id="categories" className="gateway-section"><div className="gateway-heading"><h2>Service categories</h2><p>Active featured categories returned by D4H.</p></div>{data.categories.length?<div className="gateway-category-grid home">{data.categories.map(item=><Link key={item.id} href={`/home-services?category_id=${item.id}`}>{item.imageUrl?<SafeImage src={item.imageUrl} alt="" width={48} height={48} fallbackIcon="home"/>:<Icon name="home"/>}<div><strong>{item.name}</strong><small>{item.serviceCount} services</small></div><Icon name="arrow" size={17}/></Link>)}</div>:<p className="gateway-empty">Service categories are temporarily unavailable.</p>}</section>
        <section id="journey" className="gateway-section gateway-copy"><div className="gateway-heading"><h2>How booking works</h2></div><p>Choose a category, refine the result with your location where supported, review the provider and booking details, and sign in only when you continue to a protected action.</p></section>
        <section id="request" className="gateway-callout"><Icon name="spark"/><div><span className="eyebrow">A different need?</span><h2>Post a Request</h2><p>Describe the service you need through the supported D4H request journey.</p></div><Link href="/login" className="button button-light">Continue securely <Icon name="arrow" size={17}/></Link></section>
      </div>
    </div></section>
  </>;
}
