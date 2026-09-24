import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { services } from "@/data/site";

export const metadata: Metadata = { title: "Healthcare and home services", description: "Explore virtual consultations, instant care, therapy sessions and selected home healthcare services available through Zuwara.", alternates: { canonical: "/services" } };

export default function ServicesPage(){return <><PageHero eyebrow="Explore care" title="Services designed around the way you live." description="Compare consultation, therapy and selected home-service journeys before continuing to the Zuwara booking experience."/><section className="content-section"><div className="container"><div className="listing-toolbar"><div className="category-pills"><span>All services</span><span>Consultations</span><span>Home care</span><span>Diagnostics</span><span>Wellness</span></div></div><div className="service-grid">{services.map((service,index)=><ServiceCard key={service.slug} service={service} index={index}/>)}</div></div></section></>}
