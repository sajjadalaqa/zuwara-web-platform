import type { ServiceRequest } from "./types";

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