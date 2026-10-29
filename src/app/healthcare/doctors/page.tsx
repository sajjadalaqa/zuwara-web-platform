import { getUiText } from "@/i18n/server-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { CareHero } from "@/components/healthcare/CareHero";
import { Icon } from "@/components/Icon";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import {
  HealthcareFilters,
  type HealthcareFilterValues,
} from "@/components/healthcare/HealthcareFilters";
import { searchZuwaraDoctors } from "@/lib/api/zuwara/doctors";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
function positiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function optionalGender(value: string | undefined) {
  return value === "0" || value === "1" ? Number(value) : null;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const filtered = Object.values(params).some(
    (value) => value !== undefined && value !== "",
  );
  return {
    title: "Find a Healthcare Consultant",
    description:
      "Browse real Zuwara consultant profiles by specialty, duration, consultation type, date, and availability.",
    alternates: { canonical: "/healthcare/doctors" },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const uiText = await getUiText();
  const params = await searchParams;
  const values: HealthcareFilterValues = {
    query: first(params.query),
    category: first(params.category),
    duration: first(params.duration),
    date: first(params.date),
    consultationType: first(params.consultation_type),
    gender: first(params.gender),
    availableToday: first(params.available_today),
    sort: first(params.sort),
  };
  const categoryId = positiveInt(values.category);
  const durationMinutes = positiveInt(values.duration);
  const result = await searchZuwaraDoctors({
    query: values.query,
    categoryId,
    durationMinutes,
    date: values.date || null,
    availableToday: values.availableToday === "1",
    consultationType: values.consultationType || null,
    gender: optionalGender(values.gender),
    sortType: positiveInt(values.sort),
    count: 50,
  });
  const selectedCategory = result.categories.find(
    (item) => item.id === categoryId,
  );

  return (
    <>
      <CareHero
        directory
        title={
          selectedCategory ? selectedCategory.title + " consultants" : undefined
        }
      />
      <section
        id="consultant-directory"
        className="content-section doctor-directory"
      >
        <div className="container doctor-directory-grid">
          <aside>
            <HealthcareFilters categories={result.categories} values={values} />
          </aside>
          <div className="doctor-results">
            <div className="results-heading">
              <div>
                <strong>
                  {result.doctors.length}{" "}
                  {result.doctors.length === 1 ? "consultant" : "consultants"}
                </strong>
                <span>
                  {result.mode === "keyword"
                    ? "Matching your search"
                    : result.date
                      ? `Schedule shown for ${result.date}`
                      : "Sorted by completed consultations"}
                </span>
              </div>
              <Link href="/healthcare/specialties">
                {uiText("Browse specialties")}{" "}<Icon name="arrow" size={16} />
              </Link>
            </div>
            {!result.available ? (
              <div className="data-state">
                <Icon name="heart" />
                <div>
                  <strong>{uiText("Consultant data is temporarily unavailable.")}</strong>
                  <p>{uiText("Please try again shortly.")}</p>
                </div>
              </div>
            ) : result.doctors.length ? (
              <div className="doctor-results-list">
                {result.doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor.id}
                    doctor={doctor}
                    date={result.date ?? values.date}
                    duration={result.durationMinutes ?? durationMinutes}
                  />
                ))}
              </div>
            ) : (
              <div className="directory-empty">
                <Icon name="search" size={31} />
                <h2>{uiText("No consultants match these filters.")}</h2>
                <p>
                  {uiText("Try another specialty, remove the availability filter, or search without a duration.")}{" "}</p>
                <Link
                  href="/healthcare/doctors"
                  className="button button-secondary"
                >
                  {uiText("Clear all filters")}{" "}</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
