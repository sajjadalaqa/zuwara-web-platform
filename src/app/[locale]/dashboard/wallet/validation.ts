import type { ErrorCode } from "./types";

export const MIN_TOPUP = 10;
export const MAX_TOPUP = 5000;
export const PRESETS = [50, 100, 200, 500];

// If you change the limits, update the "invalid_amount" text in copy.ts too.
export function validateAmount(raw: string): ErrorCode | null {
  if (!raw) return "required";
  if (!/^\d{1,5}$/.test(raw)) return "invalid_amount";
  const n = Number(raw);
  return n < MIN_TOPUP || n > MAX_TOPUP ? "invalid_amount" : null;
}