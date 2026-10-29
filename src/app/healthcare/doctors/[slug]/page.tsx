import { healthcareText } from "@/i18n/healthcare-text";
import { useLocale } from "next-intl";
import { getUiText } from "@/i18n/server-ui-text";
import { UserRound, Stethoscope, MapPin, GraduationCap, BadgeCheck } from "lucide-react";
import SaveProvider from "@/components/SaveProvider";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { DoctorPhoto } from "@/components/healthcare/DoctorPhoto";
import { Link } from "@/i18n/navigation";
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
  const displayLocale = useLocale();
  if (!items.length) return null;
  return <section className="profile-detail-section"><h2><span className="profile-section-icon"><BadgeCheck size={22}/></span>{title}</h2><div className="profile-detail-list">{items.map((item) => <div key={item.id}><Icon name="check" size={17}/><div><strong>{healthcareText(item, "title", displayLocale)}</strong></div></div>)}</div></section>;
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
  const displayLocale = await getLocale();
  const uiText = await getUiText();
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
  const bookingHref = canonical + "/book";
  const about = isAr ? (profile.aboutAr ?? profile.educationalJourneyAr ?? profile.about ?? profile.educationalJourney) : (profile.about ?? profile.educationalJourney);

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
      <Breadcrumbs items={[{ label: uiText("Home"), href: "/" }, { label: uiText("Healthcare"), href: "/healthcare" }, { label: uiText("Consultants"), href: "/healthcare/doctors" }, { label: profile.name }]}/>
      <div className="doctor-profile-heading">
        <div className="doctor-profile-photo"><DoctorPhoto src={profile.imageUrl} name={healthcareText(profile, "name", displayLocale)} priority sizes="(max-width: 640px) 140px, 220px"/></div>
        <div className="doctor-profile-intro"><div className="doctor-result-tags">{healthcareText(profile, "categoryTitle", displayLocale) ? <Link href={categoryHref}>{healthcareText(profile, "categoryTitle", displayLocale)}</Link> : null}{healthcareText(profile, "classificationTitle", displayLocale) ? <span>{healthcareText(profile, "classificationTitle", displayLocale)}</span> : null}</div><h1>{healthcareText(profile, "name", displayLocale)}</h1><SaveProvider id={profile.id} source="zuwara"/><p>{healthcareText(profile, "designation", displayLocale) || healthcareText(profile, "classificationTitle", displayLocale) || uiText("Healthcare consultant")}</p><div className="doctor-profile-metrics">{Number.isFinite(profile.rating) && profile.rating >= 0 ? <span><strong>★ {profile.rating.toFixed(1)}</strong> {uiText("rating")}</span> : null}{profile.reviewsCount !== undefined ? <span><strong>{profile.reviewsCount}</strong> {uiText("reviews")}</span> : null}{profile.experienceYears > 0 ? <span><strong>{profile.experienceYears}</strong> {uiText("years experience")}</span> : null}{profile.happyClients > 0 ? <span><strong>{profile.happyClients}</strong> {uiText("completed consultations")}</span> : null}</div></div>
        <aside className="doctor-profile-price"><span>{uiText("Consultations from")}</span><strong>{money(profile.startingPrice, profile.currency)}</strong><small>{uiText("Final price depends on the selected duration.")}</small><Link href={bookingHref} className="button button-primary">{isAr ? "\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0643" : uiText("Book an appointment")} <Icon name="arrow" size={17}/></Link></aside>
      </div>
    </div></section>

    <section className="content-section doctor-profile-content"><div className="container doctor-profile-grid">
      <main>
        {about || profile.aboutAr ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><UserRound size={22}/></span>{uiText("About the consultant")}</h2>{about ? <p style={{whiteSpace:"pre-line"}}>{about}</p> : null}</section> : null}
        <section className="profile-detail-section"><h2><span className="profile-section-icon"><Stethoscope size={22}/></span>{uiText("Consultation options")}</h2><div className="doctor-result-tags">{profile.consultationTypes.map(type => <span key={type}>{uiText(type)}</span>)}{profile.acceptsInstant ? <span>{uiText("Instant consultations available")}</span> : null}</div><dl className="profile-facts"><dt>{uiText("Consultant number")}</dt><dd>{profile.doctorNumber}</dd>{durations.map(item => <div key={item.minutes}><dt>{item.minutes} {uiText("minutes")}</dt><dd>{money(item.price, profile.currency)}</dd></div>)}</dl></section>
        {profile.serviceLocations?.length ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><MapPin size={22}/></span>{uiText("Service locations")}</h2>{profile.serviceLocations.map(location => <div key={location.id} className="profile-location"><h3>{healthcareText(location, "title", displayLocale)}</h3>{healthcareText(location, "address", displayLocale) ? <p style={{whiteSpace:"pre-line"}}>{healthcareText(location, "address", displayLocale)}</p> : null}</div>)}</section> : null}
        <ProfileList title={uiText("Services")} items={profile.services}/>
        <ProfileList title={uiText("Areas of expertise")} items={profile.expertise}/>
        <ProfileList title={uiText("Professional experience")} items={profile.experience}/>
        <ProfileList title={uiText("Awards and recognition")} items={profile.awards}/>
        {(healthcareText(profile, "degrees", displayLocale) || profile.degreeAr || profile.languagesSpoken) ? <section className="profile-detail-section"><h2><span className="profile-section-icon"><GraduationCap size={22}/></span>{uiText("Credentials and languages")}</h2><dl className="profile-facts">{healthcareText(profile, "degrees", displayLocale) ? <><dt>{uiText("Degrees")}</dt><dd>{healthcareText(profile, "degrees", displayLocale)}</dd></> : null}{profile.languagesSpoken ? <><dt>{uiText("Languages")}</dt><dd>{profile.languagesSpoken}</dd></> : null}</dl></section> : null}
      </main>

      <aside className="schedule-panel">
        <span className="eyebrow">{isAr ? "\u062d\u062c\u0632 \u0627\u0644\u0645\u0648\u0639\u062f" : "YOUR APPOINTMENT"}</span>
        <h2>{isAr ? "\u062e\u0637\u0648\u062a\u0643 \u0627\u0644\u0642\u0627\u062f\u0645\u0629 \u0644\u0644\u0631\u0639\u0627\u064a\u0629." : "Ready for your next step?"}</h2>
        <p style={{fontSize:14,lineHeight:1.8,color:"var(--text-secondary)",marginBottom:24}}>{isAr ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0648\u0627\u0644\u0648\u0642\u062a \u0648\u0645\u062f\u0629 \u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u0629 \u0641\u064a \u0635\u0641\u062d\u0629 \u0627\u0644\u062d\u062c\u0632." : "Choose your date, time, and consultation duration together on the booking page."}</p>
        <Link href={bookingHref} className="button button-primary" style={{width:"100%"}}>{isAr ? "\u0627\u062d\u062c\u0632 \u0645\u0648\u0639\u062f\u0643" : uiText("Book an appointment")}<Icon name="arrow" size={17}/></Link>
        <p className="schedule-disclaimer"><Icon name="shield" size={17}/>{isAr ? "\u064a\u062a\u0645 \u062a\u0623\u0643\u064a\u062f \u0627\u0644\u062a\u0648\u0641\u0631 \u0648\u0627\u0644\u0633\u0639\u0631 \u0642\u0628\u0644 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062d\u062c\u0632." : "Availability and final pricing are checked before your appointment is confirmed."}</p>
      </aside>
    </div></section>
  </>;
}
