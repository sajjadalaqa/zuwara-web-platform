import "server-only";
import { requireSession } from "@/lib/auth/session";
export type MissingFeature =
  "saved" | "reviews" | "complaints" | "referral" | "requests";
export function featureAvailable(feature: MissingFeature): boolean {
  void feature;
  return false;
}
export async function unavailableRead(feature: MissingFeature): Promise<never> {
  await requireSession();
  throw new Error("This feature has no confirmed patient API: " + feature);
}
