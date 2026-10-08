import type { Offer, ServiceRequest } from "./types";

const seed: ServiceRequest[] = [
  { id: "req_1", number: "REQ20001", category: "nursing", title: "Post-surgery wound dressing", description: "I need a nurse to change my wound dressing every other day for two weeks after my surgery.", city: "Riyadh", preferredDate: "2026-10-12", budget: 200, currency: "SAR", status: "open", offersCount: 3, createdAt: "2026-10-07T09:00:00Z" },
  { id: "req_2", number: "REQ20002", category: "caregiver", title: "Elderly care for my father, weekdays", description: "Looking for an experienced caregiver for my father, 8am to 2pm on weekdays. Help with meals and medication reminders.", city: "Jeddah", preferredDate: "2026-10-14", budget: 1500, currency: "SAR", status: "open", offersCount: 5, createdAt: "2026-10-06T14:00:00Z" },
  { id: "req_3", number: "REQ20003", category: "laboratory", title: "Fasting blood tests at home", description: "Full blood count, cholesterol and sugar tests. Sample collection early in the morning, please.", city: "Riyadh", preferredDate: "2026-10-10", budget: 150, currency: "SAR", status: "open", offersCount: 2, createdAt: "2026-10-06T08:30:00Z" },
  { id: "req_4", number: "REQ20004", category: "therapy", title: "Physiotherapy after a knee injury", description: "Three sessions per week for a month. I can't travel, so the physiotherapist would need to visit me.", city: "Riyadh", preferredDate: "2026-10-09", budget: 400, currency: "SAR", status: "in_progress", offersCount: 4, createdAt: "2026-10-03T10:00:00Z", provider: { id: "p8", name: "Reem Al-Dosari" } },
  { id: "req_5", number: "REQ20005", category: "injection", title: "Monthly vitamin B12 injection", description: "A nurse to give my monthly B12 injection at home. I have the prescription ready.", city: "Dammam", preferredDate: "2026-10-11", budget: 80, currency: "SAR", status: "in_progress", offersCount: 1, createdAt: "2026-10-04T12:00:00Z", provider: { id: "p4", name: "Nora Al-Shehri" } },
  { id: "req_6", number: "REQ20006", category: "pharmacy", title: "Prescription delivery", description: "Please deliver my monthly prescription medication to my home, and include the receipt.", city: "Riyadh", preferredDate: "2026-10-02", currency: "SAR", status: "completed", offersCount: 2, createdAt: "2026-09-30T15:00:00Z", provider: { id: "p9", name: "Al Noor Pharmacy" } },
  { id: "req_7", number: "REQ20007", category: "nursing", title: "Blood pressure monitoring visit", description: "A nurse to check my blood pressure and give guidance, since I was recently prescribed new medication.", city: "Riyadh", preferredDate: "2026-09-28", budget: 180, currency: "SAR", status: "completed", offersCount: 3, createdAt: "2026-09-25T09:00:00Z", provider: { id: "p4", name: "Nora Al-Shehri" } },
  { id: "req_8", number: "REQ20008", category: "caregiver", title: "Newborn care support", description: "Support for the first two weeks after the birth, mostly nights.", city: "Khobar", preferredDate: "2026-09-30", budget: 900, currency: "SAR", status: "cancelled", offersCount: 0, createdAt: "2026-09-22T11:00:00Z" },
  { id: "req_9", number: "REQ20009", category: "therapy", title: "Speech therapy for my daughter", description: "My daughter is 5 and needs weekly speech therapy sessions at home, preferably on weekends.", city: "Jeddah", preferredDate: "2026-10-18", budget: 300, currency: "SAR", status: "open", offersCount: 0, createdAt: "2026-10-08T07:30:00Z" },
  { id: "req_10", number: "REQ20010", category: "laboratory", title: "Vitamin D level test", description: "Home sample collection for a vitamin D test. Results by email if possible.", city: "Riyadh", preferredDate: "2026-09-20", budget: 120, currency: "SAR", status: "completed", offersCount: 2, createdAt: "2026-09-17T10:00:00Z", provider: { id: "p10", name: "Al Noor Lab" } },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraRequests: ServiceRequest[] | undefined;
}

// TODO (backend): delete this file.
export function getStore(): ServiceRequest[] {
  if (!globalThis.__zuwaraRequests) globalThis.__zuwaraRequests = structuredClone(seed);
  return globalThis.__zuwaraRequests;
}

// ---------- Offers (mock) ----------
// TODO (backend): delete all of this. Your API returns the real offers.

const POOL = [
  { id: "p4", name: "Nora Al-Shehri", specialty: "Home Nursing", rating: 4.9, reviews: 98,
    message: "Hello! I have 8 years of home care experience and can come on your preferred date. I'll bring all the supplies I need." },
  { id: "p8", name: "Reem Al-Dosari", specialty: "Physiotherapy", rating: 4.9, reviews: 77,
    message: "I'd be glad to help. I can follow a schedule that suits you and share a short progress note after each visit." },
  { id: "p11", name: "Hind Al-Qarni", specialty: "Nursing & Wound Care", rating: 4.7, reviews: 64,
    message: "Available that day, and I can arrive early in the morning if that's easier for you." },
  { id: "p12", name: "Saad Al-Anazi", specialty: "General Medicine", rating: 4.6, reviews: 121,
    message: "Happy to take this on. Feel free to message me first with any details before the visit." },
  { id: "p13", name: "Maha Al-Subaie", specialty: "Home Care", rating: 4.8, reviews: 89,
    message: "I'm nearby and can start right away. References are available on request." },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraOffers: Record<string, Offer[]> | undefined;
}

export function getOffers(r: ServiceRequest): Offer[] {
  const map = (globalThis.__zuwaraOffers ??= {});
  if (!map[r.id]) {
    const factors = [0.9, 1, 1.1, 0.95, 1.2];
    const base = r.budget ?? 150;
    map[r.id] = POOL.slice(0, r.offersCount).map((p, i) => {
      const chosen = !!r.provider && i === 0;
      const hour = String(8 + i * 2).padStart(2, "0");
      return {
        id: `${r.id}_o${i + 1}`,
        provider: chosen
          ? { id: r.provider!.id, name: r.provider!.name, specialty: p.specialty }
          : { id: p.id, name: p.name, specialty: p.specialty },
        rating: p.rating,
        reviewsCount: p.reviews,
        price: Math.round((base * factors[i]) / 5) * 5,
        currency: r.currency,
        availableAt: new Date(`${r.preferredDate}T${hour}:00:00+03:00`).toISOString(),
        message: p.message,
        status: r.provider ? (i === 0 ? "accepted" : "declined") : "pending",
        createdAt: new Date(+new Date(r.createdAt) + (i + 1) * 3 * 3600_000).toISOString(),
      } satisfies Offer;
    });
  }
  return map[r.id];
}