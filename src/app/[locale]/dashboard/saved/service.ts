import "server-only";
import { requireSession, patientApi } from "@/lib/auth/session";
import { unavailableRead } from "@/lib/api/features";
import type { ActionResult, SavedFilters, SavedResult } from "./types";
export const PAGE_SIZE = 6;
export async function getSavedProviders(
  filters: SavedFilters,
  locale: string,
): Promise<SavedResult> {
  void filters;
  void locale;
  return unavailableRead("saved");
}
export async function getSavedCount(): Promise<number> {
  const { data } = await patientApi<{
    summary: { favorite_consultants: number };
  }>("/patients/me");
  const count = data.summary?.favorite_consultants;
  if (!Number.isSafeInteger(count) || count < 0)
    throw new Error("Saved count unavailable.");
  return count;
}
export async function removeSaved(id: string): Promise<ActionResult> {
  void id;
  await requireSession();
  return { ok: false, error: "generic" };
}
