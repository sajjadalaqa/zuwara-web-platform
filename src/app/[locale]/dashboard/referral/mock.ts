import type { Referral } from "./types";

type Store = {
  code: string;
  points: number;
  lifetime: number;
  referrals: Referral[];
};

const C = "SAR";

// TODO (backend): delete this file.
const seed = (): Store => ({
  code: "ZW-MARYAM7",
  points: 420,
  lifetime: 720,
  referrals: [
    { id: "r1", name: "Hanan Al-Salem", contact: "h***@gmail.com", status: "rewarded", createdAt: "2026-09-20T10:00:00Z", reward: 30, currency: C },
    { id: "r2", name: "Abdullah Al-Rashid", contact: "a***@outlook.com", status: "rewarded", createdAt: "2026-09-12T14:00:00Z", reward: 30, currency: C },
    { id: "r3", name: "Noura Al-Fahad", contact: "n***@gmail.com", status: "joined", createdAt: "2026-10-03T09:30:00Z", currency: C },
    { id: "r4", name: "Faris Al-Mutlaq", contact: "+966 5** *** *21", status: "pending", createdAt: "2026-10-06T16:00:00Z", currency: C },
    { id: "r5", name: "Lama Al-Otaibi", contact: "l***@yahoo.com", status: "rewarded", createdAt: "2026-08-30T11:00:00Z", reward: 30, currency: C },
    { id: "r6", name: "Yousef Al-Shammari", contact: "+966 5** *** *87", status: "pending", createdAt: "2026-10-07T08:00:00Z", currency: C },
    { id: "r7", name: "Dana Al-Harbi", contact: "d***@gmail.com", status: "joined", createdAt: "2026-09-28T13:00:00Z", currency: C },
  ],
});

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraReferral: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__zuwaraReferral) globalThis.__zuwaraReferral = seed();
  return globalThis.__zuwaraReferral;
}