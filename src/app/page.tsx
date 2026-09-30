import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { JsonLd } from "@/components/JsonLd";
import { SafeImage } from "@/components/SafeImage";
import { SectionIntro } from "@/components/SectionIntro";
import { HeroSlider } from "@/components/HeroSlider";
import { getD4hCategories } from "@/lib/api/d4h/catalog";
import { getZuwaraHomeData } from "@/lib/api/zuwara/home";
import { doctorSlug, specialtySlug } from "@/lib/api/zuwara/slugs";
import { StatsCards } from "@/components/StatsCards";
import { AboutSection } from "@/components/AboutSection";
import { ServicesSection } from "@/components/ServicesSection";
import s from "./healthcare-showcase.module.css";
import j from "./healthcare-steps.module.css";
import r from "./request-showcase.module.css";
import w from "./why-choose.module.css";
import a from "./app-ecosystem.module.css";
import { DoctorsCarousel } from "@/components/DoctorsCarousel";
import { manualDoctors } from "@/data/manualDoctors";
import q from "./testimonials.module.css";
import f from "./faq-showcase.module.css";
import { ContactSection } from "@/components/ContactSection";
import z from "./final-cta.module.css";
import { TestimonialsSlider } from "./testimonials-slider";
import { PartnersMarquee } from "@/components/PartnersMarquee";

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
  { title: "Find your consultant", body: "Browse specialties and get to know the consultant who’s right for you.", icon: "search" },
  { title: "Pick a time", body: "Choose an available appointment and a consultation option that suits you.", icon: "calendar" },
  { title: "Make it official", body: "Check your appointment details and complete payment to confirm your booking.", icon: "check" },
  { title: "Keep in touch", body: "Find your reports, prescriptions and follow-up appointments in one place.", icon: "heart" },
] as const;

const homeServiceSteps = [
  ["Explore", "Browse a service category or search by the help you need."],
  ["Arrange", "Choose the provider, location, and available booking details."],
  ["Track", "Follow the booking as the service journey progresses."],
  ["Complete", "Review the completed service and keep its details accessible."],
];

const appCapabilities = [
  { icon: "calendar", title: "Bookings", body: "Appointments and service journeys" },
  { icon: "heart", title: "Healthcare", body: "Therapy, reports, prescriptions" },
  { icon: "home", title: "At home", body: "Addresses, requests, tracking" },
  { icon: "shield", title: "Account", body: "Notifications and support" },
] as const;

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



function TestimonialCard({ name, role, tag, quote, initials }: (typeof testimonials)[number]) {
  return (
    <li className={q.card}>
      <div className={q.top}>
        <span className={q.quoteMark} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.6 5C6.5 6.3 4 9.3 4 13.2V19h6.4v-6.2H7.2c0-2.3 1.2-3.9 3.2-4.9L9.6 5zm9 0c-3.1 1.3-5.6 4.3-5.6 8.2V19h6.4v-6.2h-3.2c0-2.3 1.2-3.9 3.2-4.9L18.6 5z" /></svg>
        </span>
        <span className={q.stars} role="img" aria-label="5 out of 5 stars">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9L12 2.5z" /></svg>
          ))}
        </span>
      </div>
      <blockquote><p>{quote}</p></blockquote>
      <div className={q.person}>
        <span className={q.avatar} aria-hidden="true">{initials}</span>
        <div className={q.who}><strong>{name}</strong><span>{role}</span></div>
        <span className={q.tag}>{tag}</span>
      </div>
    </li>
  );
}
  
const faqGroups = [
  { title: "Healthcare", icon: "heart", items: healthcareFaqs },
  { title: "Home services", icon: "home", items: homeServiceFaqs },
] as const;

const whyChooseUs = [
  { icon: "search", title: "Real consultant profiles", body: "Browse consultants by specialty and review supported durations and prices before you book." },
  { icon: "shield", title: "Verified payments", body: "Zuwara confirms your payment with its backend before your booking moves forward." },
  { icon: "location", title: "Services near you", body: "Location-aware discovery shows home services where provider coverage is available." },
  { icon: "calendar", title: "Everything in one place", body: "Appointments, reports, prescriptions and bookings stay together in your account." },
] as const;

function formatRating(value: number) {
  return value > 0 ? value.toFixed(1) : null;
}

export default async function Home() {
   const allFaqs = faqGroups.flatMap((group) => group.items);  
  


  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: allFaqs.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) }} />


      <HeroSlider />

      <StatsCards />
      <AboutSection />
      <ServicesSection />
     <DoctorsCarousel doctors={manualDoctors} />
    
   
        
           <section className={j.section} aria-labelledby="healthcare-journey-heading">
  <div className={`container ${j.inner}`}>
    <header className={j.header}>
      <div>
        <span className={j.eyebrow}><i /> How healthcare works</span>
        <h2 id="healthcare-journey-heading">
          From your first search <span>to your next follow-up.</span>
        </h2>
      </div>
      <p>A few simple steps to book your care. We’ll help you find your way.</p>
    </header>

    <ol className={j.steps}>
      {healthcareSteps.map(({ title, body, icon }, index) => (
        <li className={j.step} key={title}>
          <div className={j.stepTop}>
            <span className={j.icon}><Icon name={icon} size={20} /></span>
            <span className={j.number}>0{index + 1}</span>
          </div>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ol>

    
  </div>
</section>
      
      <section className={r.section} aria-labelledby="request-heading">
  <div className="container">
    <div className={r.panel}>
      <div className={r.copy}>
        <span className={r.eyebrow}><i /> Can’t find the right service?</span>
        <h2 id="request-heading">
          Describe what you need. <span>Let the right provider respond.</span>
        </h2>
      </div>
      <div className={r.side}>
        <p>Post a Request is the supported D4H alternative when the catalogue does not match a specific need. Sign-in is required only when you continue to the protected request action.</p>
        <ul className={r.points}>
          <li><span><Icon name="check" size={12} /></span>Describe what you need</li>
          <li><span><Icon name="check" size={12} /></span>Providers respond</li>
          <li><span><Icon name="check" size={12} /></span>Sign in only to continue</li>
        </ul>
        <Link href="/home-services?view=request" className={r.cta}>Post a Request <Icon name="arrow" size={16} /></Link>
      </div>
    </div>
  </div>
</section>

      <section className={w.section} aria-labelledby="why-choose-heading">
  <div className={`container ${w.inner}`}>
    <header className={w.header}>
      <div>
        <span className={w.eyebrow}><i /> Why choose Zuwara</span>
        <h2 id="why-choose-heading">
          Care and help at home, <span>made simple and trusted.</span>
        </h2>
      </div>
      <p>One connected platform for your health and your home, with clear steps and details you can rely on.</p>
    </header>

    <ul className={w.grid}>
      <li className={`${w.card} ${w.featured}`}>
        <span className={w.featuredIcon}><Icon name="heart" size={26} /></span>
        <h3>One platform, two journeys</h3>
        <p>Book healthcare consultations and trusted services at home through a single, connected Zuwara experience.</p>
        <ul className={w.chips}>
          <li><Icon name="check" size={12} /> Healthcare</li>
          <li><Icon name="check" size={12} /> Home services</li>
        </ul>
        <Link href="/how-it-works" className={w.featuredLink}>See how it works <Icon name="arrow" size={16} /></Link>
      </li>

      {whyChooseUs.map(({ icon, title, body }) => (
        <li className={w.card} key={title}>
          <span className={w.icon}><Icon name={icon} size={22} /></span>
          <h3>{title}</h3>
          <p>{body}</p>
        </li>
      ))}
    </ul>
  </div>
</section>

      <section className={a.section} aria-labelledby="app-ecosystem-heading">
  <div className={`container ${a.layout}`}>
    <div className={a.stage}>
      <span className={a.halo} aria-hidden="true" />
      <div className={`${a.device} ${a.deviceBack}`}>
        <Image src="/images/app-phone-1.png" alt="Zuwara mobile healthcare experience" width={260} height={540} sizes="(max-width: 900px) 46vw, 260px" />
      </div>
      <div className={`${a.device} ${a.deviceFront}`}>
        <Image src="/images/app-phone-2.png" alt="Zuwara mobile appointment experience" width={260} height={540} sizes="(max-width: 900px) 46vw, 260px" />
      </div>
    </div>

    <div className={a.copy}>
      <span className={a.eyebrow}><i /> One mobile experience</span>
      <h2 id="app-ecosystem-heading">
        Continue the journey <span>beyond the website.</span>
      </h2>
      <p>The Zuwara patient app supports the verified healthcare and D4H capabilities already available in the Flutter product, while keeping the two booking and wallet domains distinct.</p>

      <ul className={a.capabilities}>
        {appCapabilities.map((item) => (
          <li className={a.capability} key={item.title}>
            <span className={a.capabilityIcon}><Icon name={item.icon} size={20} /></span>
            <span className={a.capabilityText}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </span>
          </li>
        ))}
      </ul>
<div className={a.storeButtons}>
  <a href="#" className={a.storeButton} aria-label="Download for iOS">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
    Download for iOS
  </a>

  <a href="#" className={a.storeButton} aria-label="Download for Windows">
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 5.5 10.5 4.4v7.1H3zM11.5 4.25 21 3v8.5h-9.5zM3 12.5h7.5v7.1L3 18.5zM11.5 12.5H21V21l-9.5-1.3z" />
    </svg>
    Download for Windows
  </a>
</div>
    </div>
  </div>
</section>
        

      
    <section className={f.section} aria-labelledby="faq-heading">
  <div className={`container ${f.inner}`}>
    <header className={f.header}>
      <span className={f.eyebrow}>Frequently asked questions</span>
      <h2 id="faq-heading">
        Clear answers for <span>both service journeys.</span>
      </h2>
      <p>Healthcare and home services use separate backend domains, so each journey keeps its own booking, payment, and account rules.</p>
    </header>

    <div className={f.columns}>
      <div className={f.panel}>
        <div className={f.panelHead}>
          <span className={f.panelIcon}><Icon name={faqGroups[0].icon} size={20} /></span>
          <h3>Healthcare &amp; Home Services</h3>
          <span className={f.count}>{allFaqs.length} questions</span>
        </div>

        <div className={f.list}>
          {allFaqs.map((item, index) => (
            <details className={f.item} key={item.question} open={index === 0}>
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
        <strong>Still have questions?</strong>
        <p>Visit support for booking, payment and account guidance.</p>
      </div>
      <Link href="/help" className={f.helpLink}>Open support <Icon name="arrow" size={16} /></Link>
    </div>
  </div>
</section>
      <section className={q.section} aria-labelledby="testimonials-heading">
  <div className={`container ${q.inner}`}>
    <header className={q.header}>
      <span className={q.eyebrow}><i /> What people say</span>
      <h2 id="testimonials-heading">
        Trusted by people who <span>put their care first.</span>
      </h2>
      <p>Real experiences from patients and customers who use Zuwara for their health and their home.</p>
    </header>

    <TestimonialsSlider items={testimonials} />
  </div>
</section>


      <ContactSection />
<PartnersMarquee />
            <section className={z.section} aria-label="Choose your journey">
        <div className="container">
          <div className={z.banner}>
            <span className={`${z.watermark} ${z.watermarkA}`} aria-hidden="true"><Icon name="heart" size={190} /></span>
            <span className={`${z.watermark} ${z.watermarkB}`} aria-hidden="true"><Icon name="home" size={190} /></span>

            <div className={z.copy}>
              <span className={z.label}><i /> Healthcare &amp; home services</span>
              <h2>Care for your health. <span>Help for your home.</span></h2>
              <p>Explore real consultants and specialties, or browse real D4H categories and continue to provider and booking discovery.</p>
              <ul className={z.chips}>
                <li><Icon name="check" size={12} /> Consultants</li>
                <li><Icon name="check" size={12} /> Specialties</li>
                <li><Icon name="check" size={12} /> Providers</li>
                <li><Icon name="check" size={12} /> Bookings</li>
              </ul>
            </div>

            <div className={z.actions}>
              <Link href="/healthcare" className={`${z.button} ${z.primary}`}>
                <span className={z.buttonIcon}><Icon name="heart" size={18} /></span>
                Find healthcare <Icon name="arrow" size={18} />
              </Link>
              <Link href="/home-services" className={`${z.button} ${z.secondary}`}>
                <span className={z.buttonIcon}><Icon name="home" size={18} /></span>
                Book a home service <Icon name="arrow" size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>
       
    </>
  );
}
