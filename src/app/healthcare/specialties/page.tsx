import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { specialtySlug } from "@/lib/api/zuwara/slugs";

export const metadata: Metadata = { title: "Healthcare Specialties", description: "Browse active Zuwara healthcare specialties and find consultants in each category.", alternates: { canonical: "/healthcare/specialties" } };

export default async function SpecialtiesPage(){
  const data=await getZuwaraHomeData();
  return <><section className="specialty-index-hero"><div className="container"><Breadcrumbs items={[{label:"Home",href:"/"},{label:"Healthcare",href:"/healthcare"},{label:"Specialties"}]}/><span className="eyebrow">Healthcare specialties</span><h1>Start with the area of care.</h1><p>Every specialty below is loaded from the active Zuwara healthcare catalogue.</p></div></section><section className="content-section"><div className="container">{data.categories.length?<div className="specialty-index-grid">{data.categories.map((item,index)=><Link key={item.id} href={`/healthcare/specialties/${specialtySlug(item.title,item.id)}`}><span className="specialty-number">{String(index+1).padStart(2,"0")}</span><div className="specialty-index-icon">{item.imageUrl?<Image src={item.imageUrl} alt="" width={64} height={64}/>:<Icon name="heart" size={30}/>}</div><div><h2>{item.title}</h2>{item.titleAr?<p lang="ar" dir="rtl">{item.titleAr}</p>:null}</div><Icon name="arrow"/></Link>)}</div>:<div className="directory-empty"><h2>Specialties are temporarily unavailable.</h2><Link href="/healthcare" className="button button-secondary">Return to healthcare</Link></div>}</div></section></>;
}
