import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { doctorSlug, specialtySlug } from "@/lib/api/zuwara/slugs";

export const metadata: Metadata = {
  title: "Healthcare",
  description: "Explore real Zuwara healthcare specialties, consultants, therapy, and consultation journeys.",
  alternates: { canonical: "/healthcare" },
};

export default async function HealthcarePage() {
  const data = await getZuwaraHomeData();
  return <>
    <PageHero eyebrow="Zuwara Healthcare" title="Care choices, made clearer." description="Explore specialties and real consultant profiles from the Zuwara healthcare system. Booking remains connected to existing availability and payment logic." action={false}/>
    <section className="content-section"><div className="container gateway-layout">
      <aside className="gateway-aside"><span className="eyebrow">Healthcare journeys</span><h2>Choose how you want to begin.</h2><nav><Link href="/healthcare/doctors">Consultants</Link><Link href="/healthcare/specialties">Specialties</Link><Link href="/services/therapy-sessions">Therapy</Link><Link href="/services/instant-consultations">Instant consultation</Link></nav></aside>
      <div>
        <section id="specialties" className="gateway-section"><div className="gateway-heading"><h2>Specialties</h2><Link href="/healthcare/specialties">View all specialties <Icon name="arrow" size={16}/></Link></div>{data.categories.length ? <div className="gateway-category-grid">{data.categories.map(item=><Link key={item.id} href={`/healthcare/specialties/${specialtySlug(item.title,item.id)}`}>{item.imageUrl?<SafeImage src={item.imageUrl} alt="" width={48} height={48} fallbackIcon="heart"/>:<Icon name="heart"/>}<div><strong>{item.title}</strong>{item.titleAr?<small lang="ar" dir="rtl">{item.titleAr}</small>:null}</div><Icon name="arrow" size={17}/></Link>)}</div>:<p className="gateway-empty">Healthcare specialties are temporarily unavailable.</p>}</section>
        <section id="consultants" className="gateway-section"><div className="gateway-heading"><h2>Featured consultants</h2><Link href="/healthcare/doctors">View all consultants <Icon name="arrow" size={16}/></Link></div>{data.doctors.length?<div className="gateway-profile-list">{data.doctors.map(doctor=><article key={doctor.id}>{doctor.imageUrl?<SafeImage src={doctor.imageUrl} alt={`Profile photo of ${doctor.name}`} width={86} height={86}/>:<span className="profile-fallback"><Icon name="user"/></span>}<div><small>{doctor.categoryTitle ?? "Healthcare"}</small><h3>{doctor.name}</h3><p>{doctor.classificationTitle ?? doctor.designation ?? "Consultant"}</p></div><Link href={`/healthcare/doctors/${doctorSlug(doctor.name,doctor.id)}`}>View <Icon name="arrow" size={16}/></Link></article>)}</div>:<p className="gateway-empty">Consultant profiles are temporarily unavailable.</p>}</section>
      </div>
    </div></section>
  </>;
}
