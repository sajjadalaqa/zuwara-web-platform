import "server-only";
import { requireSession } from "@/lib/auth/session";
import { unavailableRead } from "@/lib/api/features";
import type {
  Loyalty,
  Paged,
  Referral,
  ReferralInfo,
  ServiceResult,
} from "./types";
export const PAGE_SIZE = 5;
export async function getLoyalty(): Promise<Loyalty> {
  return unavailableRead("referral");
}
export async function getReferralInfo(): Promise<ReferralInfo> {
  return unavailableRead("referral");
}
export async function getReferrals(
  page: number,
  locale: string,
): Promise<Paged<Referral>> {
  void page;
  void locale;
  return unavailableRead("referral");
}
export async function redeemPoints(points: number): Promise<ServiceResult> {
  void points;
  await requireSession();
  return { ok: false, code: "generic" };
}
