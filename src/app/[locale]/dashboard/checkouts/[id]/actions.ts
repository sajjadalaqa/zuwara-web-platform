"use server";
import { checkoutSession, confirmCheckout, readCheckout } from "@/lib/api/zuwara/checkouts";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
export async function paymentSessionAction(id: string) {
  try { return { ok: true as const, session: await checkoutSession(id) }; }
  catch(error) { if (error instanceof ZuwaraV2Error) return { ok: false as const }; throw error; }
}
export async function verifyPaymentAction(id: string, paymentId?: string) {
  try { return { ok: true as const, checkout: await confirmCheckout(id, paymentId) }; }
  catch(error) { if (error instanceof ZuwaraV2Error) return { ok: false as const }; throw error; }
}
export async function paymentStatusAction(id: string) { return readCheckout(id); }
