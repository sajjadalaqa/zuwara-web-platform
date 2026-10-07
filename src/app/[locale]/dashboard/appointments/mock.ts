import type { Appointment } from "./types";

const P = {
  sara: { id: "p1", name: "Dr. Sara Al-Qahtani", specialty: "Dermatology" },
  khalid: { id: "p2", name: "Dr. Khalid Al-Harbi", specialty: "General Medicine" },
  huda: { id: "p3", name: "Dr. Huda Al-Otaibi", specialty: "Therapy & Counseling" },
  nora: { id: "p4", name: "Nora Al-Shehri", specialty: "Home Nursing" },
  faisal: { id: "p5", name: "Dr. Faisal Al-Mutairi", specialty: "Pediatrics" },
  layla: { id: "p6", name: "Dr. Layla Al-Ghamdi", specialty: "Nutrition" },
};

const seed: Appointment[] = [
  { id: "apt_1", number: "APT10001", status: "pending", type: "consultation", startsAt: "2026-10-09T10:00:00Z", durationMin: 30, provider: P.sara, price: 150, currency: "SAR", paymentStatus: "unpaid" },
  { id: "apt_2", number: "APT10002", status: "accepted", type: "consultation", startsAt: "2026-10-08T14:30:00Z", durationMin: 30, provider: P.khalid, price: 120, currency: "SAR", paymentStatus: "paid" },
  { id: "apt_3", number: "APT10003", status: "accepted", type: "visit", startsAt: "2026-10-12T09:00:00Z", durationMin: 60, provider: P.nora, price: 280, currency: "SAR", paymentStatus: "paid", address: "Al Olaya District, Riyadh" },
  { id: "apt_4", number: "APT10004", status: "pending", type: "instant", startsAt: "2026-10-08T08:15:00Z", durationMin: 15, provider: P.khalid, price: 90, currency: "SAR", paymentStatus: "unpaid" },
  { id: "apt_5", number: "APT10005", status: "accepted", type: "consultation", startsAt: "2026-10-15T16:00:00Z", durationMin: 45, provider: P.huda, price: 200, currency: "SAR", paymentStatus: "paid" },
  { id: "apt_6", number: "APT10006", status: "completed", type: "consultation", startsAt: "2026-10-05T17:00:00Z", durationMin: 30, provider: P.faisal, price: 130, currency: "SAR", paymentStatus: "paid" },
  { id: "apt_7", number: "APT10007", status: "completed", type: "visit", startsAt: "2026-10-03T11:00:00Z", durationMin: 60, provider: P.nora, price: 280, currency: "SAR", paymentStatus: "paid", address: "Al Olaya District, Riyadh" },
  { id: "apt_8", number: "APT10008", status: "completed", type: "consultation", startsAt: "2026-09-28T13:00:00Z", durationMin: 30, provider: P.layla, price: 110, currency: "SAR", paymentStatus: "paid" },
  { id: "apt_9", number: "APT10009", status: "cancelled", type: "consultation", startsAt: "2026-10-04T15:00:00Z", durationMin: 30, provider: P.sara, price: 150, currency: "SAR", paymentStatus: "refunded" },
  { id: "apt_10", number: "APT10010", status: "cancelled", type: "visit", startsAt: "2026-09-30T10:00:00Z", durationMin: 60, provider: P.nora, price: 280, currency: "SAR", paymentStatus: "refunded", address: "Al Malqa District, Riyadh" },
  { id: "apt_11", number: "APT10011", status: "declined", type: "consultation", startsAt: "2026-10-02T12:00:00Z", durationMin: 45, provider: P.huda, price: 200, currency: "SAR", paymentStatus: "unpaid" },
  { id: "apt_12", number: "APT10012", status: "completed", type: "instant", startsAt: "2026-09-25T19:30:00Z", durationMin: 15, provider: P.khalid, price: 90, currency: "SAR", paymentStatus: "paid" },
  { id: "apt_13", number: "APT10013", status: "pending", type: "consultation", startsAt: "2026-10-20T11:30:00Z", durationMin: 30, provider: P.layla, price: 110, currency: "SAR", paymentStatus: "unpaid" },
  { id: "apt_14", number: "APT10014", status: "completed", type: "consultation", startsAt: "2026-09-20T09:30:00Z", durationMin: 30, provider: P.faisal, price: 130, currency: "SAR", paymentStatus: "paid" },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraAppointments: Appointment[] | undefined;
}

// Kept on globalThis so a cancel survives dev-server module reloads.
export function getStore(): Appointment[] {
  if (!globalThis.__zuwaraAppointments) {
    globalThis.__zuwaraAppointments = structuredClone(seed);
  }
  return globalThis.__zuwaraAppointments;
}