"use server";
import { unstable_rethrow } from "next/navigation";
import { activeInstant, readInstant, instantHistory, previewInstant, createInstant, payInstant, cancelInstant, instantCheckout, type InstantInput, type InstantType } from "@/lib/api/zuwara/instant";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import { checkoutUrl } from "@/lib/api/zuwara/checkouts";
import { interestFields } from "@/lib/api/zuwara/interest-fields";
import { requireSession } from "@/lib/auth/session";
import { getLocale } from "next-intl/server";
async function result<T>(run: () => Promise<T>) {
  try { return { ok: true as const, value: await run() }; }
  catch (error) { unstable_rethrow(error); return { ok: false as const, code: error instanceof ZuwaraV2Error ? error.code : "API_UNAVAILABLE", status: error instanceof ZuwaraV2Error ? error.status : undefined, requestId: error instanceof ZuwaraV2Error ? error.requestId : undefined }; }
}
export async function statusAction(uuid?: string) { return result(() => uuid ? readInstant(uuid) : activeInstant()); }
export async function historyAction(page: number) { return result(() => instantHistory(page)); }
export async function interestsAction(categoryId?: number) {
  return result(async () => { await requireSession(); return interestFields(categoryId, await getLocale()); });
}
export async function previewAction(type: InstantType, input: InstantInput) { return result(() => previewInstant(type, input)); }
export async function createAction(type: InstantType, input: InstantInput, key: string) { return result(() => createInstant(type, input, key)); }
export async function payAction(uuid: string, input: Partial<InstantInput>, key: string) { return result(() => payInstant(uuid, input, key)); }
export async function cancelAction(uuid: string, key: string) { return result(() => cancelInstant(uuid, key)); }
export async function checkoutAction(uuid: string, checkout: string, command?: "session" | "confirm", paymentId?: string) {
  return result(async () => { const value = await instantCheckout(uuid, checkout, command, paymentId); return { ...value, data: { ...value.data, checkout_url: value.data.checkout_url ? checkoutUrl(value.data.checkout_url) : null } }; });
}
