export const TIERS = ["bronze", "silver", "gold"] as const;
export type Tier = (typeof TIERS)[number];

// Lifetime points needed for each tier. PLACEHOLDER numbers: use your real thresholds.
export const TIER_MIN: Record<Tier, number> = { bronze: 0, silver: 500, gold: 1500 };

export type Loyalty = {
  points: number; // spendable balance
  lifetimePoints: number; // decides the tier
  tier: Tier;
  nextTier: Tier | null; // null = top tier
  pointsToNext: number; // 0 at the top
  progress: number; // 0 to 100, progress towards the next tier
};

export type ReferralStatus = "pending" | "joined" | "rewarded";

export type Referral = {
  id: string;
  name: string;
  contact: string; // already masked by the server, e.g. "h***@gmail.com"
  status: ReferralStatus;
  createdAt: string; // ISO 8601
  reward?: number; // set once rewarded
  currency: string; // "SAR"
};

export type ReferralInfo = {
  code: string;
  link: string;
  rewardForYou: number;
  rewardForFriend: number;
  currency: string;
  stats: { invited: number; joined: number; earned: number };
};

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number };

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode = "invalid_amount" | "insufficient_points" | "generic";

export type ServiceResult = { ok: true; credited: number } | { ok: false; code: ErrorCode };

export type RedeemState = { ok: boolean; error?: ErrorCode; credited?: number };
export const initialRedeemState: RedeemState = { ok: false };