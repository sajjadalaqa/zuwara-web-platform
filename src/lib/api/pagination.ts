import "server-only";
import type { V2Envelope } from "./zuwara/v2";
export function pagination<T>(payload: V2Envelope<T[]>) {
  const p = payload.meta?.pagination;
  if (!Array.isArray(payload.data) || !p || !Number.isSafeInteger(p.current_page) || p.current_page < 1 ||
      !Number.isSafeInteger(p.per_page) || p.per_page < 1 || !Number.isSafeInteger(p.total) || p.total < 0 ||
      !Number.isSafeInteger(p.last_page) || p.last_page < 1 || typeof p.has_more !== "boolean") throw new Error("Invalid API pagination.");
  return p;
}
export function halalas(value: unknown): number {
  if (!Number.isSafeInteger(value) || Number(value) < 0) throw new Error("Invalid monetary amount.");
  return Number(value);
}
