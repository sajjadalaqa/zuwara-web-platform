import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { HeroSlider } from "@/components/HeroSlider";
import { StatsCards } from "@/components/StatsCards";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import { DoctorsCarousel } from "@/components/DoctorsCarousel";
import { manualDoctors } from "@/data/manualDoctors";
import { ContactSection } from "@/components/ContactSection";
import { PartnersMarquee } from "@/components/PartnersMarquee";
import { TestimonialsSlider } from "./testimonials-slider";
import j from "./healthcare-steps.module.css";
import r from "./request-showcase.module.css";
import w from "./why-choose.module.css";
import a from "./app-ecosystem.module.css";
import q from "./testimonials.module.css";
import f from "./faq-showcase.module.css";
import z from "./final-cta.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home.meta" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: "/" },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: "/",
      images: [{ url: "/images/hero-doctor.png", width: 551, height: 575, alt: t("ogImageAlt") }],
    },
  };
}

const stepItems = [
  { id: "find", icon: "search" },
  { id: "time", icon: "calendar" },
  { id: "official", icon: "check" },
  { id: "touch", icon: "heart" },
] as const;

const appCapabilityItems = [
  { id: "bookings", icon: "calendar" },
  { id: "healthcare", icon: "heart" },
  { id: "home", icon: "home" },
  { id: "account", icon: "shield" },
] as const;

const whyItems = [
  { id: "profiles", icon: "search" },
  { id: "payments", icon: "shield" },
  { id: "nearby", icon: "location" },
  { id: "oneplace", icon: "calendar" },
] as const;

const faqIds = ["choose", "patients", "paid", "nearby", "missing", "track"] as const;

// Reviews stay in English on every locale
const testimonials = [
  { name: "Sara Al-Harbi", role: "Healthcare patient", tag: "Healthcare", initials: "SA", quote: "Finding the right consultant was easy. I could see the specialties and prices first, then book in a few minutes." },
  { name: "Ahmed Al-Qahtani", role: "Home services customer", tag: "Home services", initials: "AQ", quote: "I booked a home service without any calls back and forth, and I could follow the booking from start to finish." },
  { name: "Noura Al-Otaibi", role: "Healthcare patient", tag: "Healthcare", initials: "NO", quote: "My reports and prescriptions are all in one place now. Follow-up appointments are so much simpler." },
  { name: "Khalid Al-Mutairi", role: "Home services customer", tag: "Home services", initials: "KM", quote: "Everything was clear about the provider and the booking details before I confirmed, which gave me real confidence." },
  { name: "Reem Al-Ghamdi", role: "Healthcare patient", tag: "Healthcare", initials: "RG", quote: "Paying and confirming my appointment was smooth, and I knew right away that my booking was secured." },
  { name: "Omar Al-Zahrani", role: "Home services customer", tag: "Home services", initials: "OZ", quote: "I couldn't find the exact service I needed, so I posted a request and got a response quickly." },
  { name: "Laila Hassan", role: "Healthcare patient", tag: "Healthcare", initials: "LH", quote: "The whole experience feels calm and simple. I always know what the next step is." },
  { name: "Faisal Al-Dosari", role: "Home services customer", tag: "Home services", initials: "FD", quote: "One account for my health and my home. I didn't expect it to be this convenient." },
] as const;

export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  const allFaqs = faqIds.map((id) => ({
    id,
    question: t(`faq.items.${id}.question`),
    answer: t(`faq.items.${id}.answer`),
  }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: allFaqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        }}
      />

      <HeroSlider />
      <StatsCards />
      <AboutSection />
      <ServicesSection />
      <DoctorsCarousel doctors={manualDoctors} />

      {/* ---------- How healthcare works ---------- */}
      <section className={j.section} aria-labelledby="healthcare-journey-heading">
        <div className={`container ${j.inner}`}>
          <header className={j.header}>
            <div>
              <span className={j.eyebrow}><i /> {t("steps.eyebrow")}</span>
              <h2 id="healthcare-journey-heading">
                {t("steps.headingStart")} <span>{t("steps.headingHighlight")}</span>
              </h2>
            </div>
            <p>{t("steps.intro")}</p>
          </header>

          <ol className={j.steps}>
            {stepItems.map(({ id, icon }, index) => (
              <li className={j.step} key={id}>
                <div className={j.stepTop}>
                  <span className={j.icon}><Icon name={icon} size={20} /></span>
                  <span className={j.number}>0{index + 1}</span>
                </div>
                <h3>{t(`steps.${id}.title`)}</h3>
                <p>{t(`steps.${id}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Post a request ---------- */}
      <section className={r.section} aria-labelledby="request-heading">
        <div className="container">
          <div className={r.panel}>
            <div className={r.copy}>
              <span className={r.eyebrow}><i /> {t("request.eyebrow")}</span>
              <h2 id="request-heading">
                {t("request.headingStart")} <span>{t("request.headingHighlight")}</span>
              </h2>
            </div>
            <div className={r.side}>
              <p>{t("request.text")}</p>
              <ul className={r.points}>
                <li><span><Icon name="check" size={12} /></span>{t("request.point1")}</li>
                <li><span><Icon name="check" size={12} /></span>{t("request.point2")}</li>
                <li><span><Icon name="check" size={12} /></span>{t("request.point3")}</li>
              </ul>
              <Link href="/home-services?view=request" className={r.cta}>
                {t("request.cta")} <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Why choose ---------- */}
      <section className={w.section} aria-labelledby="why-choose-heading">
        <div className={`container ${w.inner}`}>
          <header className={w.header}>
            <div>
              <span className={w.eyebrow}><i /> {t("why.eyebrow")}</span>
              <h2 id="why-choose-heading">
                {t("why.headingStart")} <span>{t("why.headingHighlight")}</span>
              </h2>
            </div>
            <p>{t("why.intro")}</p>
          </header>

          <ul className={w.grid}>
            <li className={`${w.card} ${w.featured}`}>
              <span className={w.featuredIcon}><Icon name="heart" size={26} /></span>
              <h3>{t("why.featuredTitle")}</h3>
              <p>{t("why.featuredBody")}</p>
              <ul className={w.chips}>
                <li><Icon name="check" size={12} /> {t("why.chipHealthcare")}</li>
                <li><Icon name="check" size={12} /> {t("why.chipHome")}</li>
              </ul>
              <Link href="/how-it-works" className={w.featuredLink}>
                {t("why.featuredLink")} <Icon name="arrow" size={16} />
              </Link>
            </li>

            {whyItems.map(({ id, icon }) => (
              <li className={w.card} key={id}>
                <span className={w.icon}><Icon name={icon} size={22} /></span>
                <h3>{t(`why.${id}.title`)}</h3>
                <p>{t(`why.${id}.body`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- App ecosystem ---------- */}
      <section className={a.section} aria-labelledby="app-ecosystem-heading">
        <div className={`container ${a.layout}`}>
          <div className={a.stage}>
            <span className={a.halo} aria-hidden="true" />
            <div className={`${a.device} ${a.deviceBack}`}>
              <Image src="/images/my-app-2.png" alt={t("app.altBack")} width={260} height={540} sizes="(max-width: 900px) 46vw, 260px" />
            </div>
            <div className={`${a.device} ${a.deviceFront}`}>
              <Image src="/images/my-app-1.png" alt={t("app.altFront")} width={260} height={540} sizes="(max-width: 900px) 46vw, 260px" />
            </div>
          </div>

          <div className={a.copy}>
            <span className={a.eyebrow}><i /> {t("app.eyebrow")}</span>
            <h2 id="app-ecosystem-heading">
              {t("app.headingStart")} <span>{t("app.headingHighlight")}</span>
            </h2>
            <p>{t("app.text")}</p>

            <ul className={a.capabilities}>
              {appCapabilityItems.map(({ id, icon }) => (
                <li className={a.capability} key={id}>
                  <span className={a.capabilityIcon}><Icon name={icon} size={20} /></span>
                  <span className={a.capabilityText}>
                    <strong>{t(`app.${id}.title`)}</strong>
                    <span>{t(`app.${id}.body`)}</span>
                  </span>
                </li>
              ))}
            </ul>

            <div className={a.storeButtons}>
              <a href="#" className={a.storeButton} aria-label={t("app.ios")}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                {t("app.ios")}
              </a>

              <a href="#" className={a.storeButton} aria-label={t("app.windows")}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 5.5 10.5 4.4v7.1H3zM11.5 4.25 21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" />
                </svg>
                {t("app.windows")}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className={f.section} aria-labelledby="faq-heading">
        <div className={`container ${f.inner}`}>
          <header className={f.header}>
            <span className={f.eyebrow}>{t("faq.eyebrow")}</span>
            <h2 id="faq-heading">
              {t("faq.headingStart")} <span>{t("faq.headingHighlight")}</span>
            </h2>
            <p>{t("faq.intro")}</p>
          </header>

          <div className={f.columns}>
            <div className={f.panel}>
              <div className={f.panelHead}>
                <span className={f.panelIcon}><Icon name="heart" size={20} /></span>
                <h3>{t("faq.panelTitle")}</h3>
                <span className={f.count}>{t("faq.count", { count: allFaqs.length })}</span>
              </div>

              <div className={f.list}>
                {allFaqs.map((item, index) => (
                  <details className={f.item} key={item.id} open={index === 0}>
                    <summary>
                      <span className={f.question}>{item.question}</span>
                      <span className={f.toggle} aria-hidden="true" />
                    </summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>

          <div className={f.help}>
            <div>
              <strong>{t("faq.helpTitle")}</strong>
              <p>{t("faq.helpText")}</p>
            </div>
            <Link href="/help" className={f.helpLink}>
              {t("faq.helpLink")} <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Testimonials (heading translated, reviews English only) ---------- */}
      <section className={q.section} aria-labelledby="testimonials-heading">
        <div className={`container ${q.inner}`}>
          <header className={q.header}>
            <span className={q.eyebrow}><i /> {t("testimonials.eyebrow")}</span>
            <h2 id="testimonials-heading">
              {t("testimonials.headingStart")} <span>{t("testimonials.headingHighlight")}</span>
            </h2>
            <p>{t("testimonials.intro")}</p>
          </header>

          <div dir="ltr" lang="en">
            <TestimonialsSlider items={testimonials} />
          </div>
        </div>
      </section>

      <ContactSection />
      <PartnersMarquee />

      {/* ---------- Final CTA ---------- */}
      <section className={z.section} aria-label={t("cta.ariaLabel")}>
        <div className="container">
          <div className={z.banner}>
            <span className={`${z.watermark} ${z.watermarkA}`} aria-hidden="true"><Icon name="heart" size={190} /></span>
            <span className={`${z.watermark} ${z.watermarkB}`} aria-hidden="true"><Icon name="home" size={190} /></span>

            <div className={z.copy}>
              <span className={z.label}><i /> {t("cta.label")}</span>
              <h2>{t("cta.headingStart")} <span>{t("cta.headingHighlight")}</span></h2>
              <p>{t("cta.text")}</p>
              <ul className={z.chips}>
                <li><Icon name="check" size={12} /> {t("cta.chipConsultants")}</li>
                <li><Icon name="check" size={12} /> {t("cta.chipSpecialties")}</li>
                <li><Icon name="check" size={12} /> {t("cta.chipProviders")}</li>
                <li><Icon name="check" size={12} /> {t("cta.chipBookings")}</li>
              </ul>
            </div>

            <div className={z.actions}>
              <Link href="/healthcare" className={`${z.button} ${z.primary}`}>
                <span className={z.buttonIcon}><Icon name="heart" size={18} /></span>
                {t("cta.healthcare")} <Icon name="arrow" size={18} />
              </Link>
              <Link href="/home-services" className={`${z.button} ${z.secondary}`}>
                <span className={z.buttonIcon}><Icon name="home" size={18} /></span>
                {t("cta.home")} <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}