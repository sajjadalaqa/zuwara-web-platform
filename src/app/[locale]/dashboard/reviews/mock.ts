import type { PendingReview, ProviderBrief, Review } from "./types";

const P: Record<string, ProviderBrief> = {
  faisal: { id: "p5", name: "Dr. Faisal Al-Mutairi", specialty: "Pediatrics" },
  nora: { id: "p4", name: "Nora Al-Shehri", specialty: "Home Nursing" },
  layla: { id: "p6", name: "Dr. Layla Al-Ghamdi", specialty: "Nutrition" },
  khalid: { id: "p2", name: "Dr. Khalid Al-Harbi", specialty: "General Medicine" },
};

// Completed appointments. Pending = completed ones that have no review.
const completed: PendingReview[] = [
  { appointmentId: "apt_6", number: "APT10006", type: "consultation", completedAt: "2026-10-05T17:30:00Z", provider: P.faisal },
  { appointmentId: "apt_7", number: "APT10007", type: "visit", completedAt: "2026-10-03T12:00:00Z", provider: P.nora },
  { appointmentId: "apt_8", number: "APT10008", type: "consultation", completedAt: "2026-09-28T13:30:00Z", provider: P.layla },
  { appointmentId: "apt_12", number: "APT10012", type: "instant", completedAt: "2026-09-25T19:45:00Z", provider: P.khalid },
  { appointmentId: "apt_14", number: "APT10014", type: "consultation", completedAt: "2026-09-20T10:00:00Z", provider: P.faisal },
];

const reviews: Review[] = [
  {
    id: "rev_1", appointmentId: "apt_8", number: "APT10008", provider: P.layla, rating: 5,
    comment: "A very clear nutrition plan, and she followed up the next day. Highly recommended.",
    createdAt: "2026-09-29T08:00:00Z",
  },
  {
    id: "rev_2", appointmentId: "apt_14", number: "APT10014", provider: P.faisal, rating: 4,
    comment: "Patient and kind with my son. The call started a little late.",
    createdAt: "2026-09-21T10:00:00Z", updatedAt: "2026-09-22T09:00:00Z",
  },
];

type Store = { completed: PendingReview[]; reviews: Review[] };

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraReviews: Store | undefined;
}

// TODO (backend): delete this file.
export function getStore(): Store {
  if (!globalThis.__zuwaraReviews) {
    globalThis.__zuwaraReviews = structuredClone({ completed, reviews });
  }
  return globalThis.__zuwaraReviews;
}