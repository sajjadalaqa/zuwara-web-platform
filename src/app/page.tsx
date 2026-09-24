import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { SafeImage } from "@/components/SafeImage";
import { SectionIntro } from "@/components/SectionIntro";
import { UnifiedDiscovery } from "@/components/UnifiedDiscovery";
import { getD4hCategories } from "@/lib/api/d4h/catalog";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { doctorSlug, specialtySlug } from "@/lib/api/zuwara/slugs";

export const metadata: Metadata = {
  title: "Healthcare and trusted home services",
  description: "Find Zuwara consultants, book healthcare journeys, and discover trusted D4H services at home through one connected platform.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Zuwara | Healthcare and trusted services for everyday life",
    description: "Two focused journeys—healthcare and services at home—connected through one trusted Zuwara experience.",
    url: "/",
    images: [{ url: "/images/hero-doctor.png", width: 551, height: 575, alt: "Healthcare through the Zuwara platform" }],
  },
};

const healthcareSteps = [
  ["Discover", "Find a consultant by specialty, profile, and consultation option."],
  ["Choose", "Select a supported duration and available appointment time."],
  ["Confirm", "Review the booking and complete the supported payment journey."],
  ["Continue", "Return to appointments, reports, prescriptions, and follow-up."],
];

const homeServiceSteps = [
  ["Explore", "Browse a service category or search by the help you need."],
  ["Arrange", "Choose the provider, location, and available booking details."],
  ["Track", "Follow the booking as the service journey progresses."],
  ["Complete", "Review the completed service and keep its details accessible."],
];

const healthcareFaqs = [
  { question: "How do I choose a healthcare consultant?", answer: "Browse real consultant profiles by specialty, review supported consultation durations and prices, then continue to the Zuwara booking journey." },
  { question: "Can I manage more than one patient?", answer: "The authenticated Zuwara experience supports patient and dependant profiles where the existing backend permits them." },
  { question: "How is a paid appointment confirmed?", answer: "Zuwara verifies the selected payment journey with its backend before treating a booking as paid and ready for the next appointment state." },
];

const homeServiceFaqs = [
  { question: "How do I find a service available near me?", answer: "D4H supports location-aware discovery where provider coverage and service zones are configured. Location is requested only when it improves the result." },
  { question: "What if I cannot find the service I need?", answer: "Use Post a Request to describe the required work through the supported D4H request journey." },
  { question: "Can I track a home-service booking?", answer: "Authenticated D4H bookings can expose status and tracking information when those capabilities are available for the selected service." },
];

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : null;
}

export default async function Home() {
  const [healthcare, homeServices] = await Promise.all([getZuwaraHomeData(), getD4hCategories()]);
  const faqItems = [...healthcareFaqs, ...homeServiceFaqs];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: "Zuwara", url: "https://www.zuwara.sa", description: "A connected platform for healthcare and trusted services at home." }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />

      <section className="ecosystem-hero">
        <div className="container ecosystem-hero-grid">
          <div className="ecosystem-hero-copy">
            <span className="eyebrow">One Zuwara ecosystem</span>
            <h1>Trusted support for your health and your home.</h1>
            <p>Connect with healthcare consultants or arrange services at home through two focused journeys—designed to feel simple, clear, and connected.</p>
            <UnifiedDiscovery />
            <div className="hero-trust-row" aria-label="Zuwara platform qualities">
              <span><Icon name="shield" size={17} /> Clear booking journeys</span>
              <span><Icon name="check" size={17} /> Real provider data</span>
              <span><Icon name="phone" size={17} /> Mobile continuity</span>
            </div>
          </div>

          <div className="ecosystem-hero-visual" aria-label="Zuwara healthcare and home services">
            <div className="hero-portrait-panel">
              <span>Healthcare</span>
              <Image src="/images/hero-doctor.png" alt="Consultant available through Zuwara" width={551} height={575} priority />
            </div>
            <div className="hero-service-panel">
              <div><Icon name="home" size={22} /><span>Services at home</span></div>
              <strong>{homeServices.categories[0]?.name ?? "Care at your location"}</strong>
              <p>Discover categories, providers, and location-aware booking through D4H.</p>
              <Link href="/home-services">Explore services <Icon name="arrow" size={16} /></Link>
            </div>
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
          </div>
        </div>
      </section>

      <section className="pathways" id="start">
        <div className="container pathways-grid">
          <div className="pathways-index"><span>01 — 02</span><p>Choose the journey that matches what you need today.</p></div>
          <article className="pathway pathway-health">
            <div><span>01</span><Icon name="heart" size={26} /></div>
            <h2>Healthcare</h2>
            <p>Find consultants, arrange consultations, access therapy, and keep your care information connected.</p>
            <ul><li>Consultants & specialties</li><li>Therapy & instant consultations</li><li>Appointments & follow-up</li></ul>
            <Link href="/healthcare">Explore healthcare <Icon name="arrow" size={18} /></Link>
          </article>
          <article className="pathway pathway-home">
            <div><span>02</span><Icon name="home" size={26} /></div>
            <h2>Home Services</h2>
            <p>Browse real service categories, providers, shops, labs, and request support at your location.</p>
            <ul><li>Categories & services</li><li>Providers & professionals</li><li>Bookings & tracking</li></ul>
            <Link href="/home-services">Explore home services <Icon name="arrow" size={18} /></Link>
          </article>
        </div>
      </section>

      <section className="section healthcare-discovery">
        <div className="container">
          <SectionIntro eyebrow="Healthcare discovery" title="Find care with the details that matter." body="Specialties and consultant profiles below come directly from the Zuwara healthcare API. Availability and booking remain owned by the existing healthcare backend." href="/healthcare" linkLabel="Explore healthcare" />

          {healthcare.categories.length > 0 ? (
            <div className="api-category-strip" aria-label="Healthcare specialties">
              {healthcare.categories.slice(0, 8).map((item) => (
                <Link key={item.id} href={`/healthcare/specialties/${specialtySlug(item.title, item.id)}`}>
                  <span className="api-category-icon">{item.imageUrl ? <SafeImage src={item.imageUrl} alt="" width={52} height={52} fallbackIcon="heart" /> : <Icon name="heart" size={25} />}</span>
                  <strong>{item.title}</strong>
                  {item.titleAr ? <small lang="ar" dir="rtl">{item.titleAr}</small> : null}
                </Link>
              ))}
            </div>
          ) : (
            <div className="data-state"><Icon name="heart" /><div><strong>Healthcare catalogue is temporarily unavailable.</strong><p>You can still continue to the healthcare journey and try again.</p></div><Link href="/healthcare">Open healthcare</Link></div>
          )}

          {healthcare.doctors.length > 0 ? (
            <div className="live-doctor-grid">
              {healthcare.doctors.slice(0, 3).map((doctor) => (
                <article className="live-doctor-card" key={doctor.id}>
                  <div className="live-doctor-image">
                    {doctor.imageUrl ? <SafeImage src={doctor.imageUrl} alt={`Profile photo of ${doctor.name}`} fill sizes="(max-width: 760px) 100vw, 33vw" /> : <div className="profile-fallback"><Icon name="user" size={38} /></div>}
                    <span>{doctor.categoryTitle ?? "Healthcare consultant"}</span>
                  </div>
                  <div className="live-doctor-body">
                    <div className="doctor-labels"><span>{doctor.classificationTitle ?? doctor.designation ?? "Consultant"}</span>{formatRating(doctor.rating) ? <span className="doctor-rating">★ {formatRating(doctor.rating)}</span> : null}</div>
                    <h3>{doctor.name}</h3>
                    {doctor.nameAr ? <p className="doctor-arabic-name" lang="ar" dir="rtl">{doctor.nameAr}</p> : null}
                    <div className="doctor-facts">{doctor.experienceYears > 0 ? <span>{doctor.experienceYears} years experience</span> : null}<span>From {doctor.startingPrice} {doctor.currency}</span></div>
                    <Link href={`/healthcare/doctors/${doctorSlug(doctor.name, doctor.id)}`}>View consultant <Icon name="arrow" size={17} /></Link>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="journey-section journey-healthcare">
        <div className="container">
          <SectionIntro eyebrow="The healthcare journey" title="A clearer path from discovery to follow-up." body="Each step keeps the important choice visible while the existing Zuwara backend remains responsible for availability, payment, and appointment state." inverse />
          <div className="journey-steps">{healthcareSteps.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="section home-discovery">
        <div className="container home-discovery-layout">
          <div>
            <SectionIntro eyebrow="Home services discovery" title="Useful services, brought closer to home." body="These categories are loaded from the active D4H catalogue. Service availability can vary by provider coverage and location." href="/home-services" linkLabel="Browse all categories" />
            {homeServices.categories.length > 0 ? (
              <div className="home-category-list">
                {homeServices.categories.slice(0, 6).map((item, index) => (
                  <Link key={item.id} href={`/home-services?category_id=${item.id}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <div className="home-category-icon">{item.imageUrl ? <SafeImage src={item.imageUrl} alt="" width={45} height={45} fallbackIcon="home" /> : <Icon name="home" size={23} />}</div>
                    <div><strong>{item.name}</strong><small>{item.serviceCount} {item.serviceCount === 1 ? "service" : "services"}</small></div>
                    <Icon name="arrow" size={18} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="data-state"><Icon name="home" /><div><strong>Home-service catalogue is temporarily unavailable.</strong><p>Continue to D4H discovery to try again.</p></div><Link href="/home-services">Open home services</Link></div>
            )}
          </div>
          <aside className="home-editorial">
            <div className="home-editorial-mark"><Icon name="location" size={23} /><span>Location-aware where supported</span></div>
            <Image src="/images/care-3.png" alt="A service professional supporting a customer" width={620} height={720} />
            <blockquote>“Choose by need first. Location and provider coverage refine what is genuinely available.”</blockquote>
          </aside>
        </div>
      </section>

      <section className="section request-band">
        <div className="container request-band-grid">
          <div><span className="eyebrow eyebrow-light">Can’t find the right service?</span><h2>Describe what you need. Let the right provider respond.</h2></div>
          <div><p>Post a Request is the supported D4H alternative when the catalogue does not match a specific need. Sign-in is required only when you continue to the protected request action.</p><Link href="/home-services?view=request" className="button button-light">Post a Request <Icon name="arrow" size={18} /></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionIntro eyebrow="The home-service journey" title="Book with context. Track with confidence." body="Discovery stays public. Protected actions such as booking, favourites, addresses, requests, and tracking continue through the authenticated D4H experience." />
          <div className="journey-steps journey-steps-light">{homeServiceSteps.map(([title, body], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
        </div>
      </section>

      <section className="section app-ecosystem">
        <div className="container app-ecosystem-grid">
          <div className="app-device-stage"><Image src="/images/app-phone-1.png" alt="Zuwara mobile healthcare experience" width={260} height={540} /><Image src="/images/app-phone-2.png" alt="Zuwara mobile appointment experience" width={260} height={540} /></div>
          <div className="app-ecosystem-copy">
            <span className="eyebrow eyebrow-light">One mobile experience</span><h2>Continue the journey beyond the website.</h2><p>The Zuwara patient app supports the verified healthcare and D4H capabilities already available in the Flutter product, while keeping the two booking and wallet domains distinct.</p>
            <div className="app-capability-grid"><div><Icon name="calendar" /><strong>Bookings</strong><span>Appointments and service journeys</span></div><div><Icon name="heart" /><strong>Healthcare</strong><span>Therapy, reports, prescriptions</span></div><div><Icon name="home" /><strong>At home</strong><span>Addresses, requests, tracking</span></div><div><Icon name="shield" /><strong>Account</strong><span>Notifications and support</span></div></div>
            <Link href="/download" className="button button-light">Explore the mobile app <Icon name="arrow" size={18} /></Link>
          </div>
        </div>
      </section>

      <section className="section insight-section">
        <div className="container">
          <SectionIntro eyebrow="Understand before you act" title="Guidance for better-prepared decisions." body="Product guidance explains how to use Zuwara. It does not replace medical advice or invent provider claims." href="/insights" linkLabel="Explore insights" />
          <div className="insight-ledger"><Link href="/how-it-works"><span>Platform guide</span><h3>Choosing the right Zuwara journey</h3><p>Understand the difference between healthcare consultations and services delivered at your location.</p><Icon name="arrow" /></Link><Link href="/insights"><span>Healthcare guide</span><h3>Prepare before a consultation</h3><p>Gather the booking details and relevant information your consultant may need.</p><Icon name="arrow" /></Link><Link href="/help"><span>Booking guide</span><h3>Know what happens after payment</h3><p>Learn how booking and payment states move through the supported platform journey.</p><Icon name="arrow" /></Link></div>
        </div>
      </section>

      <section className="section faq-unified">
        <div className="container">
          <SectionIntro eyebrow="Frequently asked questions" title="Clear answers for both service journeys." body="Healthcare and home services use separate backend domains, so each journey keeps its own booking, payment, and account rules." href="/help" linkLabel="Open support" />
          <div className="faq-columns"><div><h3><Icon name="heart" /> Healthcare</h3>{healthcareFaqs.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div><div><h3><Icon name="home" /> Home services</h3>{homeServiceFaqs.map((item, index) => <details key={item.question} open={index === 0}><summary>{item.question}<span>+</span></summary><p>{item.answer}</p></details>)}</div></div>
        </div>
      </section>

      <section className="section final-dual-cta">
        <div className="container final-dual-grid"><div><span>Healthcare</span><h2>Find the right care path.</h2><p>Explore real consultants, specialties, and supported consultation journeys.</p><Link href="/healthcare" className="button button-light">Find healthcare <Icon name="arrow" size={18} /></Link></div><div><span>Home services</span><h2>Bring trusted help closer.</h2><p>Browse real D4H categories and continue to provider and booking discovery.</p><Link href="/home-services" className="button button-secondary">Book a home service <Icon name="arrow" size={18} /></Link></div></div>
      </section>
    </>
  );
}
