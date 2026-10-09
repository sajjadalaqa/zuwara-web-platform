import type { ErrorCode } from "./types";

// PLACEHOLDER rules: use your real ones.
export const REDEEM_OPTIONS = [100, 200, 500]; // points
export const POINTS_PER_SAR = 10; // 10 points = SAR 1
export const pointsToSar = (points: number) => points / POINTS_PER_SAR;

export function validateRedeem(raw: string): ErrorCode | null {
  if (!/^\d{1,4}$/.test(raw)) return "invalid_amount";
  return REDEEM_OPTIONS.includes(Number(raw)) ? null : "invalid_amount";
}