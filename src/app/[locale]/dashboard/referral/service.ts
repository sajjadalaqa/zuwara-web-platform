import { cache } from "react";
import { getStore as getWalletStore } from "../wallet/mock"; // TODO (backend): delete (mock only)
import { getStore } from "./mock"; // TODO (backend): delete this import
import { pointsToSar } from "./validation";
import { TIER_MIN } from "./types";
import type { Loyalty, Paged, Referral, ReferralInfo, ServiceResult, Tier } from "./types";

export const PAGE_SIZE = 5;

// TODO (backend): your API should return the finished Loyalty object, so delete this helper.
function computeLoyalty(points: number, lifetime: number): Loyalty {
  const tier: Tier = lifetime >= TIER_MIN.gold ? "gold" : lifetime >= TIER_MIN.silver ? "silver" : "bronze";
  const nextTier: Tier | null = tier === "bronze" ? "silver" : tier === "silver" ? "gold" : null;
  const pointsToNext = nextTier ? TIER_MIN[nextTier] - lifetime : 0;
  const progress = nextTier
    ? Math.round(((lifetime - TIER_MIN[tier]) / (TIER_MIN[nextTier] - TIER_MIN[tier])) * 100)
    : 100;
  return { points, lifetimePoints: lifetime, tier, nextTier, pointsToNext, progress };
}

export const getLoyalty = cache(async (): Promise<Loyalty> => {
  // TODO (backend):
  // const res = await fetch(`${process.env.API_URL}/me/loyalty`, {
  //   headers: { Authorization: `Bearer ${await getToken()}` }, cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load loyalty");
  // return (await res.json()) as Loyalty;
  const { points, lifetime } = getStore();
  return computeLoyalty(points, lifetime);
});

export const getReferralInfo = cache(async (): Promise<ReferralInfo> => {
  // TODO (backend): GET `${API_URL}/me/referral` -> { code, link, rewardForYou, rewardForFriend, currency, stats }
  // The link and the reward amounts below are PLACEHOLDERS.
  const { code, referrals } = getStore();
  return {
    code,
    link: `https://zuwara-web-platform.vercel.app/register-page?ref=${code}`,
    rewardForYou: 30,
    rewardForFriend: 20,
    currency: "SAR",
    stats: {
      invited: referrals.length,
      joined: referrals.filter((r) => r.status !== "pending").length,
      earned: referrals.reduce((n, r) => n + (r.reward ?? 0), 0),
    },
  };
});

export async function getReferrals(page: number, locale: string): Promise<Paged<Referral>> {
  // TODO (backend): replace the body with
  // const res = await fetch(`${process.env.API_URL}/me/referrals?page=${page}&pageSize=${PAGE_SIZE}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load referrals");
  // return (await res.json()) as Paged<Referral>;
  void locale;

  const all = [...getStore().referrals].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);

  return {
    items: all.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    total: all.length,
    page: current,
    pageSize: PAGE_SIZE,
  };
}

export async function redeemPoints(points: number): Promise<ServiceResult> {
  // TODO (backend): POST `${API_URL}/me/loyalty/redeem` { points }
  // Your backend deducts the points and credits the wallet in ONE transaction.
  // Map errors: 400 -> "invalid_amount", 409 -> "insufficient_points".
  const store = getStore();
  if (store.points < points) return { ok: false, code: "insufficient_points" };

  const credited = pointsToSar(points);
  store.points -= points;

  // Mock only: credit the wallet so you can see it on the Wallet page.
  const wallet = getWalletStore();
  wallet.balance += credited;
  wallet.txs.push({
    id: `tx_${Date.now()}`,
    type: "topup",
    direction: "in",
    status: "completed",
    amount: credited,
    currency: "SAR",
    createdAt: new Date().toISOString(),
    method: "Rewards",
  });

  return { ok: true, credited };
}