import type { ComplaintDetail } from "./types";

export type StoredComplaint = Omit<ComplaintDetail, "repliesCount">;

// TODO (backend): delete this file.
const seed: StoredComplaint[] = [
  {
    id: "cmp_1", number: "CMP30001", category: "payment", status: "in_review",
    subject: "Charged twice for one appointment",
    description: "I was charged SAR 120 two times for my video consultation. Both payments show on my card statement.",
    relatedRef: "APT10002",
    createdAt: "2026-10-06T09:00:00Z", updatedAt: "2026-10-07T11:00:00Z",
    messages: [
      { id: "m1", from: "support", createdAt: "2026-10-06T13:00:00Z", body: "Thanks for reaching out. We're checking the payment records and will update you within 24 hours." },
      { id: "m2", from: "you", createdAt: "2026-10-07T08:30:00Z", body: "Thank you. Let me know if you need the card statement." },
      { id: "m3", from: "support", createdAt: "2026-10-07T11:00:00Z", body: "We can see the duplicate charge, and no statement is needed. We've passed it to our payments team to reverse." },
    ],
    timeline: [
      { key: "submitted", at: "2026-10-06T09:00:00Z" },
      { key: "in_review", at: "2026-10-06T13:00:00Z" },
    ],
  },
  {
    id: "cmp_2", number: "CMP30002", category: "provider", status: "open",
    subject: "Provider arrived 40 minutes late",
    description: "My home visit was scheduled for 11:00 but the nurse only arrived at 11:40 without any message beforehand.",
    relatedRef: "APT10007",
    createdAt: "2026-10-08T07:00:00Z", updatedAt: "2026-10-08T07:00:00Z",
    messages: [],
    timeline: [{ key: "submitted", at: "2026-10-08T07:00:00Z" }],
  },
  {
    id: "cmp_3", number: "CMP30003", category: "appointment", status: "resolved",
    subject: "Video call link didn't work",
    description: "I couldn't join my video consultation because the link showed an error, and the provider waited for me.",
    relatedRef: "APT10006",
    createdAt: "2026-10-01T18:00:00Z", updatedAt: "2026-10-02T10:00:00Z",
    messages: [
      { id: "m1", from: "support", createdAt: "2026-10-02T08:00:00Z", body: "We're sorry about that. We found a problem with the link on our side." },
      { id: "m2", from: "support", createdAt: "2026-10-02T10:00:00Z", body: "We've credited SAR 20 to your wallet as an apology, and the issue is now fixed. Thank you for your patience." },
    ],
    timeline: [
      { key: "submitted", at: "2026-10-01T18:00:00Z" },
      { key: "in_review", at: "2026-10-02T08:00:00Z" },
      { key: "resolved", at: "2026-10-02T10:00:00Z" },
    ],
  },
  {
    id: "cmp_4", number: "CMP30004", category: "app", status: "closed",
    subject: "Notifications are not arriving",
    description: "I don't receive notifications when a provider accepts my appointment, so I only find out when I open the app.",
    createdAt: "2026-09-22T09:00:00Z", updatedAt: "2026-09-26T09:00:00Z",
    messages: [
      { id: "m1", from: "support", createdAt: "2026-09-23T09:00:00Z", body: "Thanks for letting us know. Could you tell us which phone and browser you use?" },
      { id: "m2", from: "support", createdAt: "2026-09-25T09:00:00Z", body: "We released a fix for this. Please let us know if it still happens, otherwise we'll close this complaint." },
    ],
    timeline: [
      { key: "submitted", at: "2026-09-22T09:00:00Z" },
      { key: "in_review", at: "2026-09-23T09:00:00Z" },
      { key: "resolved", at: "2026-09-25T09:00:00Z" },
      { key: "closed", at: "2026-09-26T09:00:00Z" },
    ],
  },
  {
    id: "cmp_5", number: "CMP30005", category: "request", status: "in_review",
    subject: "Provider cancelled my accepted request",
    description: "A provider accepted my request for a monthly injection, then cancelled the day before without explanation.",
    relatedRef: "REQ20005",
    createdAt: "2026-10-05T12:00:00Z", updatedAt: "2026-10-06T09:00:00Z",
    messages: [
      { id: "m1", from: "support", createdAt: "2026-10-06T09:00:00Z", body: "We're sorry about this. We're contacting the provider and checking whether another provider can cover your request." },
    ],
    timeline: [
      { key: "submitted", at: "2026-10-05T12:00:00Z" },
      { key: "in_review", at: "2026-10-06T09:00:00Z" },
    ],
  },
  {
    id: "cmp_6", number: "CMP30006", category: "payment", status: "resolved",
    subject: "Refund not received",
    description: "My appointment was cancelled but the refund hasn't reached my wallet yet.",
    relatedRef: "APT10009",
    createdAt: "2026-10-04T14:00:00Z", updatedAt: "2026-10-05T10:00:00Z",
    messages: [
      { id: "m1", from: "support", createdAt: "2026-10-05T10:00:00Z", body: "The refund of SAR 150 was delayed and has now been added to your wallet. Thank you for your patience." },
    ],
    timeline: [
      { key: "submitted", at: "2026-10-04T14:00:00Z" },
      { key: "in_review", at: "2026-10-05T08:00:00Z" },
      { key: "resolved", at: "2026-10-05T10:00:00Z" },
    ],
  },
  {
    id: "cmp_7", number: "CMP30007", category: "other", status: "open",
    subject: "Please add more cities",
    description: "I'd love to use Zuwara for my parents who live in Abha. Are there plans to cover more cities soon?",
    createdAt: "2026-10-07T16:00:00Z", updatedAt: "2026-10-07T16:00:00Z",
    messages: [],
    timeline: [{ key: "submitted", at: "2026-10-07T16:00:00Z" }],
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraComplaints: StoredComplaint[] | undefined;
}

export function getStore(): StoredComplaint[] {
  if (!globalThis.__zuwaraComplaints) globalThis.__zuwaraComplaints = structuredClone(seed);
  return globalThis.__zuwaraComplaints;
}