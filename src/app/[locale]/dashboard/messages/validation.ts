import type { ErrorCode } from "./types";

// If you change the limit, update "too_long" in copy.ts too.
export const MAX_MESSAGE = 1000;

export function validateMessage(body: string): ErrorCode | null {
  const m = body.trim();
  if (!m) return "required";
  if (m.length > MAX_MESSAGE) return "too_long";
  return null;
}