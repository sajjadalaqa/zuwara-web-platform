import type { SavedProvider } from "./types";

const seed: SavedProvider[] = [
  { id: "p1", name: "Dr. Sara Al-Qahtani", specialty: "Dermatology", city: "Riyadh", rating: 4.9, reviewsCount: 212, priceFrom: 150, currency: "SAR", services: ["consultation", "visit"], availableToday: true, savedAt: "2026-10-06T10:00:00Z" },
  { id: "p2", name: "Dr. Khalid Al-Harbi", specialty: "General Medicine", city: "Jeddah", rating: 4.7, reviewsCount: 340, priceFrom: 120, currency: "SAR", services: ["consultation", "instant"], availableToday: true, savedAt: "2026-10-05T09:00:00Z" },
  { id: "p3", name: "Dr. Huda Al-Otaibi", specialty: "Therapy & Counseling", city: "Riyadh", rating: 4.8, reviewsCount: 156, priceFrom: 200, currency: "SAR", services: ["consultation"], availableToday: false, savedAt: "2026-10-03T14:00:00Z" },
  { id: "p4", name: "Nora Al-Shehri", specialty: "Home Nursing", city: "Riyadh", rating: 4.9, reviewsCount: 98, priceFrom: 280, currency: "SAR", services: ["visit"], availableToday: false, savedAt: "2026-10-01T08:30:00Z" },
  { id: "p5", name: "Dr. Faisal Al-Mutairi", specialty: "Pediatrics", city: "Dammam", rating: 4.6, reviewsCount: 187, priceFrom: 130, currency: "SAR", services: ["consultation", "visit"], availableToday: true, savedAt: "2026-09-28T12:00:00Z" },
  { id: "p6", name: "Dr. Layla Al-Ghamdi", specialty: "Nutrition", city: "Jeddah", rating: 4.8, reviewsCount: 121, priceFrom: 110, currency: "SAR", services: ["consultation"], availableToday: false, savedAt: "2026-09-25T16:00:00Z" },
  { id: "p7", name: "Dr. Omar Al-Zahrani", specialty: "Cardiology", city: "Riyadh", rating: 4.7, reviewsCount: 205, priceFrom: 250, currency: "SAR", services: ["consultation"], availableToday: false, savedAt: "2026-09-20T11:00:00Z" },
  { id: "p8", name: "Reem Al-Dosari", specialty: "Physiotherapy", city: "Khobar", rating: 4.9, reviewsCount: 77, priceFrom: 180, currency: "SAR", services: ["visit", "consultation"], availableToday: true, savedAt: "2026-09-15T09:30:00Z" },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraSaved: SavedProvider[] | undefined;
}

// TODO (backend): delete this file.
export function getStore(): SavedProvider[] {
  if (!globalThis.__zuwaraSaved) globalThis.__zuwaraSaved = structuredClone(seed);
  return globalThis.__zuwaraSaved;
}