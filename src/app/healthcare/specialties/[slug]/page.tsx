import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/data/site";
import { searchZuwaraDoctors } from "@/lib/api/zuwara/doctors";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { idFromSlug, specialtySlug } from "@/lib/api/zuwara/slugs";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const id = idFromSlug(slug);
  if (!id) return {};
  const data = await getZuwaraHomeData();
  const specialty = data.categories.find((item) => item.id === id);
  if (!specialty) return {};

  return {
    title: `${specialty.title} Consultants`,
    description: `Browse active Zuwara ${specialty.title} consultant profiles, consultation options, and appointment availability.`,
    alternates: { canonical: `/healthcare/specialties/${specialtySlug(specialty.title, specialty.id)}` },
  };
}

export default async function SpecialtyDetailPage({ params }: Props) {
  const { slug } = await params;
  const id = idFromSlug(slug);
  if (!id) notFound();

  const [home, search] = await Promise.all([
    getZuwaraHomeData(),
    searchZuwaraDoctors({ categoryId: id, count: 50 }),
  ]);
  const specialty = home.categories.find((item) => item.id === id);
  if (!specialty) notFound();
  const canonical = `/healthcare/specialties/${specialtySlug(specialty.title, specialty.id)}`;

  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "MedicalWebPage",
      name: `${specialty.title} consultants`,
      url: `${SITE_URL}${canonical}`,
      about: { "@type": "MedicalSpecialty", name: specialty.title },
    }}/>
    <section className="specialty-detail-hero">
      <div className="container">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Healthcare", href: "/healthcare" }, { label: "Specialties", href: "/healthcare/specialties" }, { label: specialty.title }]}/>
        <div className="specialty-detail-heading">
          <div className="specialty-detail-icon">{specialty.imageUrl ? <Image src={specialty.imageUrl} alt="" width={88} height={88}/> : <Icon name="heart" size={38}/>}</div>
          <div><span className="eyebrow">Healthcare specialty</span><h1>{specialty.title}</h1>{specialty.titleAr ? <p lang="ar" dir="rtl">{specialty.titleAr}</p> : null}</div>
        </div>
        <div className="specialty-detail-summary"><strong>{search.doctors.length}</strong><span>active {search.doctors.length === 1 ? "consultant" : "consultants"} currently listed in this specialty</span><Link href={`/healthcare/doctors?category=${specialty.id}`}>Refine results <Icon name="arrow" size={17}/></Link></div>
      </div>
    </section>
    <section className="content-section"><div className="container">
      {search.available && search.doctors.length ? <div className="doctor-results-list">{search.doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor}/>)}</div> : <div className="directory-empty"><Icon name="search" size={32}/><h2>No active consultants are listed yet.</h2><p>Explore another specialty or return to the complete consultant directory.</p><Link className="button button-secondary" href="/healthcare/doctors">View all consultants</Link></div>}
    </div></section>
  </>;
}
