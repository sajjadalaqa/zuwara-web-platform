import { UserRound, Stethoscope, MapPin, GraduationCap, BadgeCheck } from "lucide-react";
import SaveProvider from "@/components/SaveProvider";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DoctorPhoto } from "@/components/healthcare/DoctorPhoto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/data/site";
import { getZuwaraDoctorProfile, riyadhToday } from "@/lib/api/zuwara/doctors";
import { doctorSlug, idFromSlug, specialtySlug } from "@/lib/api/zuwara/slugs";
import type { ZuwaraProfileItem } from "@/lib/api/zuwara/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { params: Promise<{ slug: string }>; searchParams: SearchParams };

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function duration(value: string | undefined) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }
function safeDate(value: string | undefined) { return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : riyadhToday(); }
function money(value: string | null, currency: string) { return value !== null && value.trim() !== "" && Number.isFinite(Number(value)) && Number(value) >= 0 ? `${Number(value).toFixed(2)} ${currency}` : "Price in app"; }

function ProfileList({ title, items }: { title: string; items: ZuwaraProfileItem[] }) {
  if (!items.length) return null;
  return <section className="profile-detail-section"><h2><span className="profile-section-icon"><BadgeCheck size={22}/></span>{title}</h2><div className="profile-detail-list">{items.map((item) => <div key={item.id}><Icon name="check" size={17}/><div><strong>{item.title}</strong>{item.titleAr ? <span lang="ar" dir="rtl">{item.titleAr}</span> : null}</div></div>)}</div></section>;
}


export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const id = idFromSlug(slug);
  if (!id) return {};
  const profile = await getZuwaraDoctorProfile(id, safeDate(first(query.date)), duration(first(query.duration)));
  if (!profile) return {};
  const canonical = `/healthcare/doctors/${doctorSlug(profile.name, profile.id)}`;
  return {
    title: `${profile.name} | ${profile.categoryTitle ?? "Healthcare Consultant"}`,
    description: `View ${profile.name}'s verified Zuwara profile, consultation durations, and date-based appointment availability.`,
    alternates: { canonical },
    openGraph: { type: "profile", title: profile.name, description: profile.designation ?? profile.categoryTitle ?? "Zuwara healthcare consultant", url: canonical, images: profile.imageUrl ? [{ url: profile.imageUrl, alt: profile.name }] : undefined },
  };
}

export default async function DoctorProfilePage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const id = idFromSlug(slug);
  if (!id) notFound();
  const selectedDate = safeDate(first(query.date));
  const selectedDuration = duration(first(query.duration));
  const profile = await getZuwaraDoctorProfile(id, selectedDate, selectedDuration);
  if (!profile) notFound();

  const canonical = `/healthcare/doctors/${doctorSlug(profile.name, profile.id)}`;
  const categoryHref = profile.categoryId && profile.categoryTitle ? `/healthcare/specialties/${specialtySlug(profile.categoryTitle, profile.categoryId)}` : "/healthcare/specialties";
  const durations = (profile.durationOptions ?? []).filter((item) => item.enabled);
  const isAr = (await getLocale()) === "ar";
  const bookingHref = (isAr ? "/ar" : "") + canonical + "/book";
  const about = profile.about ?? profile.educationalJourney;

  return <>
    <JsonLd data={{
      "@context": "https://schema.org",
      "@type": "Physician",
      name: profile.name,
      url: `${SITE_URL}${canonical}`,
      image: profile.imageUrl ?? undefined,
      description: profile.designation ?? profile.about ?? undefined,
      medicalSpecialty: profile.categoryTitle ?? undefined,
    }}/>
    <section className="doctor-profile-hero"><div className="container">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Healthcare", href: "/healthcare" }, { label: "Consultants", href: "/healthcare/doctors" }, { label: profile.name }]}/>
      <div className="doctor-profile-heading">
        <div className="doctor-profile-photo"><DoctorPhoto src={profile.imageUrl} name={profile.name} priority sizes="(max-width: 640px) 140px, 220px"/></div>
        <div className="doctor-profile-intro"><div className="doctor-result-tags">{profile.categoryTitle ? <Link href={categoryHref}>{profile.categoryTitle}</Link> : null}{profile.classificationTitle ? <span>{profile.classificationTitle}</span> : null}</div><h1>{profile.name}</h1><SaveProvider id={profile.id} source="zuwara"/>{profile.nameAr ? <p className="doctor-profile-name-ar" lang="ar" dir="rtl">{profile.nameAr}</p> : null}<p>{profile.designation ?? profile.classificationTitle ?? "Healthcare consultant"}</p><div className="doctor-profile-metrics">{Number.isFinite(profile.rating) && profile.rating >= 0 ? <span><strong>★ {profile.rating.toFixed(1)}</strong> rating</span> : null}{profile.reviewsCount !== undefined ? <span><strong>{profile.reviewsCount}</strong> reviews</span> : null}{profile.experienceYears > 0 ? <span><strong>{profile.experienceYears}</strong> years experience</span> : null}{profile.happyClients > 0 ? <span><strong>{profile.happyClients}</strong> completed consultations</span> : null}</div></div>
        <aside className="doctor-profile-price"><span>Consultations from</span><strong>{money(profile.startingPrice, profile.currency)}</strong><small>Final price depends on the selected duration.</small><Link href={bookingHref} className="button button-primary">{isAr ? "\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0643" : "Book an appointment"} <Icon name="arrow" size={17}/></Link></aside>
      </div>
    </div></section>

    <section className="content-section doctor-profile-content"><div className="container doctor-profile-grid">
      <main>
        {about || profile.aboutAr ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><UserRound size={22}/></span>About the consultant</h2>{about ? <p style={{whiteSpace:"pre-line"}}>{about}</p> : null}{profile.aboutAr ? <p lang="ar" dir="rtl">{profile.aboutAr}</p> : null}</section> : null}
        <section className="profile-detail-section"><h2><span className="profile-section-icon"><Stethoscope size={22}/></span>Consultation options</h2><div className="doctor-result-tags">{profile.consultationTypes.map(type => <span key={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</span>)}{profile.acceptsInstant ? <span>Instant consultations available</span> : null}</div><dl className="profile-facts"><dt>Consultant number</dt><dd>{profile.doctorNumber}</dd>{durations.map(item => <div key={item.minutes}><dt>{item.minutes} minutes</dt><dd>{money(item.price, profile.currency)}</dd></div>)}</dl></section>
        {profile.serviceLocations?.length ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><MapPin size={22}/></span>Service locations</h2>{profile.serviceLocations.map(location => <div key={location.id} className="profile-location"><h3>{location.title}</h3>{location.titleAr ? <p lang="ar" dir="rtl">{location.titleAr}</p> : null}{location.address ? <p style={{whiteSpace:"pre-line"}}>{location.address}</p> : null}{location.addressAr ? <p lang="ar" dir="rtl" style={{whiteSpace:"pre-line"}}>{location.addressAr}</p> : null}</div>)}</section> : null}
        <ProfileList title="Services" items={profile.services}/>
        <ProfileList title="Areas of expertise" items={profile.expertise}/>
        <ProfileList title="Professional experience" items={profile.experience}/>
        <ProfileList title="Awards and recognition" items={profile.awards}/>
        {(profile.degrees || profile.degreeAr || profile.languagesSpoken) ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><GraduationCap size={22}/></span>Credentials and languages</h2><dl className="profile-facts">{profile.degrees ? <><dt>Degrees</dt><dd>{profile.degrees}</dd></> : null}{profile.degreeAr ? <><dt>Degrees (Arabic)</dt><dd lang="ar" dir="rtl">{profile.degreeAr}</dd></> : null}{profile.languagesSpoken ? <><dt>Languages</dt><dd>{profile.languagesSpoken}</dd></> : null}</dl></section> : null}
      </main>

      <aside className="schedule-panel">
        <span className="eyebrow">{isAr ? "\u062d\u062c\u0632 \u0627\u0644\u0645\u0648\u0639\u062f" : "YOUR APPOINTMENT"}</span>
        <h2>{isAr ? "\u062e\u0637\u0648\u062a\u0643 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0644\u0644\u0631\u0639\u0627\u064a\u0629." : "Ready for your next step?"}</h2>
        <p style={{fontSize:14,lineHeight:1.8,color:"var(--text-secondary)",marginBottom:24}}>{isAr ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0648\u0627\u0644\u0648\u0642\u062a \u0648\u0645\u062f\u0629 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0641\u064a \u0635\u0641\u062d\u0629 \u0627\u0644\u062d\u062c\u0632." : "Choose your date, time, and consultation duration together on the booking page."}</p>
        <Link href={bookingHref} className="button button-primary" style={{width:"100%"}}>{isAr ? "\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0643" : "Book an appointment"}<Icon name="arrow" size={17}/></Link>
        <p className="schedule-disclaimer"><Icon name="shield" size={17}/>{isAr ? "\u064a\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062a\u0648\u0641\u0631 \u0648\u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062d\u062c\u0632." : "Availability and final pricing are checked before your appointment is confirmed."}</p>
      </aside>
    </div></section>
  </>;
}
