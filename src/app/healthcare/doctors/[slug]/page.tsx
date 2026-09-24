import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { SITE_URL } from "@/data/site";
import { getZuwaraDoctorProfile, riyadhToday } from "@/lib/api/zuwara/doctors";
import { doctorSlug, idFromSlug, specialtySlug } from "@/lib/api/zuwara/slugs";
import type { ZuwaraProfileItem, ZuwaraSlot } from "@/lib/api/zuwara/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type Props = { params: Promise<{ slug: string }>; searchParams: SearchParams };

function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value; }
function duration(value: string | undefined) { const parsed = Number(value); return Number.isInteger(parsed) && parsed > 0 ? parsed : null; }
function safeDate(value: string | undefined) { return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : riyadhToday(); }
function displayTime(value: string) {
  const normalized = value.replace(":", "").padStart(4, "0");
  const hour = Number(normalized.slice(0, 2));
  const minute = normalized.slice(2, 4);
  return Number.isFinite(hour) ? `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}` : value;
}
function money(value: string | null, currency: string) { return value && Number(value) > 0 ? `${Number(value).toFixed(2)} ${currency}` : "Price in app"; }

function ProfileList({ title, items }: { title: string; items: ZuwaraProfileItem[] }) {
  if (!items.length) return null;
  return <section className="profile-detail-section"><h2>{title}</h2><div className="profile-detail-list">{items.map((item) => <div key={item.id}><Icon name="check" size={17}/><div><strong>{item.title}</strong>{item.titleAr ? <span lang="ar" dir="rtl">{item.titleAr}</span> : null}</div></div>)}</div></section>;
}

function Slot({ slot, bookingHref }: { slot: ZuwaraSlot; bookingHref: string }) {
  const label = `${displayTime(slot.startTime)}–${displayTime(slot.endTime)}`;
  if (slot.available) return <Link className="schedule-slot schedule-slot-available" href={bookingHref}><span>{label}</span><small>Available</small></Link>;
  return <span className={`schedule-slot schedule-slot-${slot.status}`} aria-disabled="true"><span>{label}</span><small>{slot.status === "booked" ? "Booked" : slot.status === "reserved" ? "Reserved" : slot.status === "past" ? "Past" : "Unavailable"}</small></span>;
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
  const activeDuration = profile.selectedDurationMinutes ?? selectedDuration ?? durations[0]?.minutes ?? null;
  const bookingHref = `/login?next=${encodeURIComponent(`${canonical}?date=${profile.selectedDate}${activeDuration ? `&duration=${activeDuration}` : ""}`)}`;
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
        <div className="doctor-profile-photo">{profile.imageUrl ? <Image src={profile.imageUrl} alt={`Profile photo of ${profile.name}`} fill priority sizes="(max-width: 640px) 140px, 220px"/> : <span className="profile-fallback"><Icon name="user" size={52}/></span>}</div>
        <div className="doctor-profile-intro"><div className="doctor-result-tags">{profile.categoryTitle ? <Link href={categoryHref}>{profile.categoryTitle}</Link> : null}{profile.classificationTitle ? <span>{profile.classificationTitle}</span> : null}</div><h1>{profile.name}</h1>{profile.nameAr ? <p className="doctor-profile-name-ar" lang="ar" dir="rtl">{profile.nameAr}</p> : null}<p>{profile.designation ?? profile.classificationTitle ?? "Healthcare consultant"}</p><div className="doctor-profile-metrics">{profile.rating > 0 ? <span><strong>★ {profile.rating.toFixed(1)}</strong> rating</span> : null}{profile.experienceYears > 0 ? <span><strong>{profile.experienceYears}</strong> years experience</span> : null}{profile.happyClients > 0 ? <span><strong>{profile.happyClients}</strong> completed consultations</span> : null}</div></div>
        <aside className="doctor-profile-price"><span>Consultations from</span><strong>{money(profile.startingPrice, profile.currency)}</strong><small>Final price depends on the selected duration.</small><a href="#availability" className="button button-primary">Check availability <Icon name="arrow" size={17}/></a></aside>
      </div>
    </div></section>

    <section className="content-section doctor-profile-content"><div className="container doctor-profile-grid">
      <main>
        {about ? <section className="profile-detail-section"><h2>About the consultant</h2><p>{about}</p>{profile.aboutAr ? <p lang="ar" dir="rtl">{profile.aboutAr}</p> : null}</section> : null}
        <ProfileList title="Services" items={profile.services}/>
        <ProfileList title="Areas of expertise" items={profile.expertise}/>
        <ProfileList title="Professional experience" items={profile.experience}/>
        <ProfileList title="Awards and recognition" items={profile.awards}/>
        {(profile.degrees || profile.degreeAr || profile.languagesSpoken) ? <section className="profile-detail-section"><h2>Credentials and languages</h2><dl className="profile-facts">{profile.degrees ? <><dt>Degrees</dt><dd>{profile.degrees}</dd></> : null}{profile.degreeAr ? <><dt>Degrees (Arabic)</dt><dd lang="ar" dir="rtl">{profile.degreeAr}</dd></> : null}{profile.languagesSpoken ? <><dt>Languages</dt><dd>{profile.languagesSpoken}</dd></> : null}</dl></section> : null}
      </main>

      <aside id="availability" className="schedule-panel">
        <span className="eyebrow">Appointment availability</span><h2>Choose a date and duration.</h2>
        <form action={canonical} method="get" className="schedule-filter"><label><span>Date</span><input type="date" name="date" min={riyadhToday()} defaultValue={profile.selectedDate}/></label><label><span>Duration</span><select name="duration" defaultValue={activeDuration ?? ""}><option value="">All durations</option>{durations.map((item) => <option key={item.minutes} value={item.minutes}>{item.minutes} min · {money(item.price, profile.currency)}</option>)}</select></label><button className="button button-secondary" type="submit">Update schedule</button></form>
        <div className="schedule-legend"><span><i className="legend-available"/>Available</span><span><i className="legend-booked"/>Booked</span><span><i className="legend-reserved"/>Reserved</span></div>
        {profile.slots?.length ? <div className="schedule-slots">{profile.slots.map((slot) => <Slot key={`${slot.startTime}-${slot.endTime}`} slot={slot} bookingHref={bookingHref}/>)}</div> : <div className="schedule-empty"><Icon name="calendar" size={28}/><strong>{profile.scheduleMessage ?? "No schedule is available for this selection."}</strong><p>Try another date or an enabled consultation duration.</p></div>}
        <p className="schedule-disclaimer"><Icon name="shield" size={17}/>Selecting an available time continues to secure Zuwara sign-in. Final slot validation and booking remain handled by the existing Zuwara platform.</p>
      </aside>
    </div></section>
  </>;
}
