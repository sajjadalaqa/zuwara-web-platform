export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zuwara.sa";

// Search engines stay blocked until SITE_INDEXABLE=true is set (go-live on the real domain).
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  icon: string;
  category: "Consultations" | "Home care" | "Diagnostics" | "Wellness";
  highlights: string[];
};

export const services: Service[] = [
  { slug: "virtual-consultations", title: "Virtual consultations", short: "Speak with a qualified consultant from wherever you feel comfortable.", description: "A private, convenient consultation journey that connects patients with the right healthcare professional through the Zuwara app.", icon: "/icons/ic_virtual_consultation.png", category: "Consultations", highlights: ["Choose by specialty", "Secure appointment chat", "Reports and follow-up in one place"] },
  { slug: "instant-consultations", title: "Instant consultations", short: "Request timely guidance from available healthcare professionals.", description: "Submit your request, match with an available consultant, and follow the payment and appointment status from one clear journey.", icon: "/icons/ic_instant_appointment.png", category: "Consultations", highlights: ["Public or private request", "Clear availability status", "Verified payment confirmation"] },
  { slug: "therapy-sessions", title: "Therapy sessions", short: "Structured therapy plans with session-by-session continuity.", description: "Browse therapy plans, select a consultant and schedule a coordinated group of sessions with transparent booking information.", icon: "/icons/ic_therapy_sessions.png", category: "Wellness", highlights: ["Plan-based care", "Flexible duration options", "Session history and progress"] },
  { slug: "nurse-visit", title: "Nurse visit", short: "Professional nursing support delivered at your location.", description: "Explore home nursing options and arrange a visit through Zuwara's connected home-services experience.", icon: "/icons/ic_nurrse_visit.png", category: "Home care", highlights: ["Home-based support", "Provider details", "Booking status tracking"] },
  { slug: "laboratory", title: "Laboratory services", short: "Discover convenient laboratory services and provider options.", description: "Review available laboratory services, prepare your selections and manage the booking from one digital experience.", icon: "/icons/ic_laboraotry.png", category: "Diagnostics", highlights: ["Browse test services", "Compare providers", "Digital booking history"] },
  { slug: "vaccination", title: "Vaccination services", short: "Convenient access to selected vaccination services.", description: "Find vaccination services offered by connected providers and view the details needed before requesting a visit.", icon: "/icons/ic_kid_vacination.png", category: "Home care", highlights: ["Service information", "Provider availability", "Simple booking journey"] },
  { slug: "seasonal-care", title: "Seasonal care", short: "Explore seasonal wellness and vaccination options.", description: "A focused service area for seasonal needs, presented with clear eligibility and provider information.", icon: "/icons/ic_seasonal_flu_vacine.png", category: "Wellness", highlights: ["Seasonal options", "Clear preparation notes", "Home-service convenience"] },
  { slug: "care-offers", title: "Care offers", short: "Discover selected care programs and service packages.", description: "Explore relevant healthcare and home-service offers while retaining transparent pricing and service scope.", icon: "/icons/ic_offers.png", category: "Wellness", highlights: ["Transparent inclusions", "Digital eligibility", "Easy service discovery"] },
];

export const articles = [
  { slug: "prepare-for-a-virtual-consultation", title: "How to prepare for a virtual consultation", excerpt: "A practical checklist to help you make the most of an online appointment.", category: "Virtual care", read: "4 min read" },
  { slug: "choosing-the-right-care-path", title: "Choosing the right care path", excerpt: "Understand when virtual care, therapy or a home visit may fit your needs.", category: "Care guidance", read: "5 min read" },
  { slug: "manage-family-health-records", title: "Keep family health journeys organized", excerpt: "Simple ways to manage dependants, appointments and reports in one place.", category: "Patient guide", read: "3 min read" },
];

export const specialties = [
  { slug: "family-medicine", title: "Family medicine", icon: "/icons/specialties/ic_family_medicine.png", description: "Explore family medicine consultation options and prepare for a clear, coordinated appointment journey." },
  { slug: "general-medicine", title: "General medicine", icon: "/icons/specialties/ic_general_medicine.png", description: "Find general medicine consultation information, duration options and the next available care steps." },
  { slug: "internal-medicine", title: "Internal medicine", icon: "/icons/specialties/ic_internal_medicine.png", description: "Review internal medicine consultation information and prepare relevant health history before booking." },
  { slug: "mental-wellness", title: "Mental wellness", icon: "/icons/specialties/ic_psychiatry_and_psychologist.png", description: "Understand virtual and structured mental wellness care paths available through the Zuwara experience." },
  { slug: "pediatrics", title: "Pediatrics", icon: "/icons/specialties/ic_pediatrics.png", description: "Discover pediatric consultation information designed to help families prepare for the right appointment." },
  { slug: "dermatology", title: "Dermatology", icon: "/icons/specialties/ic_dermatology_plastic_surgery.png", description: "Browse dermatology consultation information and learn how to prepare relevant symptoms or images." },
  { slug: "dentistry", title: "Dentistry", icon: "/icons/specialties/ic_dentistry.png", description: "Explore dentistry consultation and service information through an organized digital care journey." },
  { slug: "cardiology", title: "Cardiology", icon: "/icons/specialties/ic_cardiology.png", description: "Review cardiology consultation information and find the appropriate non-emergency care path." },
  { slug: "neurology", title: "Neurology", icon: "/icons/specialties/ic_neurology.png", description: "Explore neurology consultation information, profile details and appointment preparation guidance." },
  { slug: "ent", title: "Ear, nose and throat", icon: "/icons/specialties/ic_ear_nose_throat.png", description: "Explore ear, nose and throat consultation information and the appropriate appointment journey." },
  { slug: "ophthalmology", title: "Ophthalmology", icon: "/icons/specialties/ic_ophthalmology.png", description: "Find ophthalmology consultation information and prepare for an eye-care appointment." },
  { slug: "orthopedics", title: "Orthopedics", icon: "/icons/specialties/ic_orthopedics.png", description: "Review orthopedic consultation information for non-emergency bone, muscle and joint concerns." },
];

export const homeFaqs = [
  { question: "How do I find the right consultant?", answer: "Start with a specialty or search term, review the consultant profile and choose an enabled consultation duration and available time." },
  { question: "Can I book for a family member?", answer: "Zuwara supports managed patient profiles so an authenticated user can organize eligible appointments for dependants." },
  { question: "How are online payments confirmed?", answer: "Payment status is verified by the Zuwara backend with the selected payment provider before a booking is treated as paid." },
  { question: "What is an instant consultation?", answer: "An instant consultation request helps a patient connect with an available consultant through the supported public or private request journey." },
  { question: "Does Zuwara also provide home services?", answer: "The Zuwara ecosystem includes selected home-service discovery and booking journeys that are separate from healthcare consultation appointments." },
];
