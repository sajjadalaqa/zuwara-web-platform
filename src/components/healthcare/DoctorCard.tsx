import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { doctorSlug } from "@/lib/api/zuwara/slugs";
import type { ZuwaraDoctor } from "@/lib/api/zuwara/types";

function displayTime(value: string) {
  const normalized = value.replace(":", "").padStart(4, "0");
  const hour = Number(normalized.slice(0, 2));
  const minute = normalized.slice(2, 4);
  if (!Number.isFinite(hour)) return value;
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

export function DoctorCard({ doctor, date, duration }: { doctor: ZuwaraDoctor; date?: string | null; duration?: number | null }) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (duration) params.set("duration", String(duration));
  const suffix = params.size ? `?${params.toString()}` : "";
  const href = `/healthcare/doctors/${doctorSlug(doctor.name, doctor.id)}${suffix}`;
  const previewSlots = doctor.slots?.slice(0, 5) ?? [];
  const rating = doctor.rating > 0 ? doctor.rating.toFixed(1) : null;
  const hasPrice = Number(doctor.startingPrice) > 0;

  return <article className="doctor-result-card">
    <div className="doctor-result-photo">
      {doctor.imageUrl ? <Image src={doctor.imageUrl} alt={`Profile photo of ${doctor.name}`} fill sizes="(max-width: 720px) 120px, 180px" /> : <span className="profile-fallback"><Icon name="user" size={38}/></span>}
    </div>
    <div className="doctor-result-main">
      <div className="doctor-result-tags"><span>{doctor.categoryTitle ?? "Healthcare"}</span>{doctor.classificationTitle ? <span>{doctor.classificationTitle}</span> : null}</div>
      <h2><Link href={href}>{doctor.name}</Link></h2>
      {doctor.nameAr ? <p className="doctor-name-ar" lang="ar" dir="rtl">{doctor.nameAr}</p> : null}
      <p className="doctor-designation">{doctor.designation ?? doctor.classificationTitle ?? "Healthcare consultant"}</p>
      <div className="doctor-result-meta">
        {rating ? <span className="rating">★ {rating}</span> : null}
        {doctor.experienceYears > 0 ? <span>{doctor.experienceYears} years experience</span> : null}
        {doctor.happyClients > 0 ? <span>{doctor.happyClients} completed consultations</span> : null}
      </div>
      {previewSlots.length > 0 ? <div className="slot-preview" aria-label="Schedule preview">{previewSlots.map((slot) => <span key={`${slot.startTime}-${slot.endTime}`} className={`slot-${slot.status}`}>{displayTime(slot.startTime)}</span>)}</div> : doctor.scheduleMessage ? <p className="schedule-note">{doctor.scheduleMessage}</p> : null}
    </div>
    <div className="doctor-result-action">
      <small>{duration ? `${duration} minute consultation` : "Consultation"}</small>
      <strong>{hasPrice ? <>From {doctor.startingPrice} {doctor.currency}</> : "View pricing"}</strong>
      <Link href={href} className="button button-primary">View profile <Icon name="arrow" size={17}/></Link>
    </div>
  </article>;
}
