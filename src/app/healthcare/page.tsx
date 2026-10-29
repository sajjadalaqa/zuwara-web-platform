import { healthcareText } from "@/i18n/healthcare-text";
import { getLocale } from "next-intl/server";
import { getUiText } from "@/i18n/server-ui-text";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { CareHero } from "@/components/healthcare/CareHero";
import { DoctorCard } from "@/components/healthcare/DoctorCard";
import s from "@/components/healthcare/care-experience.module.css";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { specialtySlug } from "@/lib/api/zuwara/slugs";
const pageMetadata: Metadata = {
  title: "Healthcare",
  description:
    "Explore Zuwara specialties and find a consultant for your next step in care.",
  alternates: { canonical: "/healthcare" },
};
export async function generateMetadata(): Promise<Metadata> {
  const uiText = await getUiText();
  return { ...pageMetadata, title: typeof pageMetadata.title === 'string' ? uiText(pageMetadata.title) : pageMetadata.title, description: pageMetadata.description ? uiText(pageMetadata.description) : undefined };
}

export default async function HealthcarePage() {
  const displayLocale = await getLocale();
  const uiText = await getUiText();
  const data = await getZuwaraHomeData();
  return (
    <>
      <CareHero />
      <section className={s.section}>
        <div className={s.inner}>
          <header className={s.sectionHead}>
            <span className={s.pill}>
              <Icon name="heart" size={14} /> {uiText("FIND YOUR AREA OF CARE")}{" "}</span>
            <h2>
              {uiText("Different needs.")}{" "}<br />
              <em>{uiText("Care for every chapter.")}</em>
            </h2>
            <p>
              {uiText("Start with what matters to you. Explore our specialties and find your way to the right support.")}{" "}</p>
          </header>
          {data.categories.length ? (
            <div className={s.specialties}>
              {data.categories.map((item, index) => (
                <Link
                  className={s.specialty}
                  key={item.id}
                  href={
                    "/healthcare/specialties/" +
                    specialtySlug(healthcareText(item, "title", displayLocale), item.id)
                  }
                >
                  <span>
                    <Icon
                      name={
                        index % 4 === 0
                          ? "heart"
                          : index % 4 === 1
                            ? "spark"
                            : index % 4 === 2
                              ? "user"
                              : "home"
                      }
                      size={28}
                    />
                  </span>
                  <h3>{healthcareText(item, "title", displayLocale)}</h3>

                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </div>
          ) : (
            <p className={s.empty}>
              {uiText("Specialties are temporarily unavailable. Please try again shortly.")}{" "}</p>
          )}
          <div className={s.centerAction}>
            <Link className={s.secondary} href="/healthcare/specialties">
              {uiText("Explore all specialties")}{" "}<Icon name="arrow" size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className={s.section + " " + s.sectionSoft}>
        <div className={s.inner}>
          <header className={s.sectionHead}>
            <span className={s.pill}>
              <Icon name="user" size={14} /> {uiText("PEOPLE BEHIND YOUR CARE")}{" "}</span>
            <h2>
              {uiText("A connection that makes")}{" "}<br />
              <em>{uiText("all the difference.")}</em>
            </h2>
            <p>
              {uiText("Meet our consultants. Get to know their specialties, explore consultation options and take the next step at your pace.")}{" "}</p>
          </header>
          {data.doctors.length ? (
            <div className={s.featuredGrid}>
              {data.doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <p className={s.empty}>
              {uiText("Consultants are temporarily unavailable. Please try again shortly.")}{" "}</p>
          )}
          <div className={s.centerAction}>
            <Link href="/healthcare/doctors" className={s.primary}>
              {uiText("Meet all consultants")}{" "}<Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className={s.section}>
        <div className={s.inner}>
          <header className={s.sectionHead}>
            <span className={s.pill}>
              <Icon name="calendar" size={14} /> {uiText("A LITTLE GUIDANCE")}{" "}</span>
            <h2>
              {uiText("Your next step,")}{" "}<br />
              <em>{uiText("made simple.")}</em>
            </h2>
            <p>
              {uiText("From finding a consultant to choosing your consultation, everything starts here.")}{" "}</p>
          </header>
          <div className={s.steps}>
            {[
              {
                icon: "search" as const,
                title: "Find your consultant",
                body: "Explore specialties and profiles to find someone who fits your needs.",
              },
              {
                icon: "calendar" as const,
                title: uiText("Choose your time"),
                body: "Check the available dates, durations and consultation options.",
              },
              {
                icon: "heart" as const,
                title: "Take your next step",
                body: "Review your appointment details and complete your booking.",
              },
            ].map((step, index) => (
              <article className={s.step} key={step.title}>
                <span className={s.stepNumber}>0{index + 1}</span>
                <Icon name={step.icon} size={30} />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className={s.section + " " + s.sectionSoft}>
        <div className={s.inner}>
          <div className={s.banner}>
            <div>
              <h2>
                {uiText("You do not have to figure")}{" "}<br />
                {uiText("it all out alone.")}{" "}</h2>
              <p>
                {uiText("Not sure where to begin? Our team can help you explore the care options available on Zuwara.")}{" "}</p>
            </div>
            <Link href="/contact" className={s.secondary}>
              {uiText("Talk to our team")}{" "}<Icon name="arrow" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
