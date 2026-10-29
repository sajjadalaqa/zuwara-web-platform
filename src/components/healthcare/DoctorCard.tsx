import { healthcareText } from "@/i18n/healthcare-text";
import { useLocale } from "next-intl";
import { useUiText } from "@/i18n/use-ui-text";
import { DoctorPhoto } from "@/components/healthcare/DoctorPhoto";
import { Link } from "@/i18n/navigation";
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
  const displayLocale = useLocale();
  const uiText = useUiText();
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (duration) params.set("duration", String(duration));
  const suffix = params.size ? `?${params.toString()}` : "";
  const href = `/healthcare/doctors/${doctorSlug(doctor.name, doctor.id)}${suffix}`;
  const previewSlots = doctor.slots?.slice(0, 5) ?? [];
  const rating = Number.isFinite(doctor.rating) && doctor.rating >= 0 ? doctor.rating.toFixed(1) : null;
  const hasPrice = doctor.startingPrice != null && String(doctor.startingPrice).trim() !== "" && Number.isFinite(Number(doctor.startingPrice)) && Number(doctor.startingPrice) >= 0;

  return <article className="doctor-result-card">
    <div className="doctor-result-photo">
      <DoctorPhoto src={doctor.imageUrl} name={healthcareText(doctor, "name", displayLocale)} sizes="(max-width: 720px) 120px, 180px" />
    </div>
    <div className="doctor-result-main">
      <div className="doctor-result-tags"><span>{healthcareText(doctor, "categoryTitle", displayLocale) || uiText("Healthcare")}</span>{healthcareText(doctor, "classificationTitle", displayLocale) ? <span>{healthcareText(doctor, "classificationTitle", displayLocale)}</span> : null}</div>
      <h2><Link href={href}>{healthcareText(doctor, "name", displayLocale)}</Link></h2>

      <p className="doctor-designation">{healthcareText(doctor, "designation", displayLocale) || healthcareText(doctor, "classificationTitle", displayLocale) || uiText("Healthcare consultant")}</p>
      <div className="doctor-result-meta">
        {rating ? <span className="rating">★ {rating}</span> : null}
        {doctor.reviewsCount !== undefined ? <span>{doctor.reviewsCount} {uiText("reviews")}</span> : null}
        {doctor.experienceYears > 0 ? <span>{doctor.experienceYears} {uiText("years experience")}</span> : null}
        {doctor.happyClients > 0 ? <span>{doctor.happyClients} {uiText("completed consultations")}</span> : null}
      </div>
      <div className="doctor-result-tags">{doctor.consultationTypes.map(type => <span key={type}>{uiText(type)}</span>)}{doctor.acceptsInstant ? <span>{uiText("Instant consultations available")}</span> : null}</div>
      {previewSlots.length > 0 ? <div className="slot-preview" aria-label={uiText("Schedule preview")}>{previewSlots.map((slot) => <span key={`${slot.startTime}-${slot.endTime}`} className={`slot-${slot.status}`}>{displayTime(slot.startTime)}</span>)}</div> : doctor.scheduleMessage ? <p className="schedule-note">{doctor.scheduleMessage}</p> : null}
    </div>
    <div className="doctor-result-action">
      <small>{duration ? `${duration} ${uiText("minute consultation")}` : uiText("Consultation")}</small>
      <strong>{hasPrice ? <>{uiText("From")}{" "}{doctor.startingPrice} {doctor.currency}</> : uiText("View pricing")}</strong>
      <Link href={href} className="button button-primary">{uiText("View profile")}{" "}<Icon name="arrow" size={17}/></Link>
    </div>
  </article>;
}
