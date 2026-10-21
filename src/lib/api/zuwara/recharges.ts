import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { patientApi, requireSession, readCookie } from "@/lib/auth/session";
import { seal } from "@/lib/auth/seal";
import { ZuwaraV2Error } from "./v2";
type Intent = { identity: string; key: string; amount: number; id?: string };
export type Recharge = { id: string; status: string; currency: string; amount_halalas: number; payment_url: string | null; wallet_recharge_id: number | null };
const COOKIE = "zuwara_recharge";
export function paymentUrl(value: unknown): string {
  if (typeof value !== "string") throw new Error("Missing payment URL.");
  const url = new URL(value);
  const hosts = ["sa.myfatoorah.com", "demo.myfatoorah.com", "portal.myfatoorah.com", "portal.sa.myfatoorah.com"];
  if (url.protocol !== "https:" || url.username || url.password || url.port || !hosts.includes(url.hostname)) throw new Error("Untrusted payment URL.");
  return url.href;
}
async function intent() {
  const { user } = await requireSession();
  const value = await readCookie<Intent>(COOKIE);
  return value?.identity === user.id ? value : null;
}
async function save(value: Intent) {
  const secret = process.env.NEXT_SERVER_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Missing session secret.");
  (await cookies()).set(COOKIE, seal(value, secret, COOKIE), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 7 * 86400 });
}
function validate(data: Recharge) {
  if (!/^[a-f0-9-]{36}$/i.test(data.id) || !Number.isSafeInteger(data.amount_halalas) || data.amount_halalas < 100 || data.currency !== "SAR" ||
      !["creating", "pending", "credited", "needs_review", "failed"].includes(data.status)) throw new Error("Invalid recharge response.");
  return data;
}
export async function getPendingRecharge(): Promise<{ state: "uncertain" } | Recharge | null> {
  const current = await intent();
  if (!current) return null;
  if (!current.id) return { state: "uncertain" };
  const { data } = await patientApi<Recharge>("/wallet/recharges/" + current.id);
  const row = validate(data);
  if (row.id !== current.id || row.amount_halalas !== current.amount) throw new Error("Recharge mismatch.");
  return row;
}
export async function createRecharge(amount: number): Promise<{ ok: true; paymentUrl: string } | { ok: false; error: "generic" }> {
  const { user } = await requireSession();
  let current = await intent();
  if (current?.id) {
    const previous = await getPendingRecharge();
    if (previous && "id" in previous && previous.status === "credited") current = null;
    else if (previous && "id" in previous && previous.status === "pending" && previous.amount_halalas === amount) {
      return { ok: true, paymentUrl: paymentUrl(previous.payment_url) };
    } else return { ok: false, error: "generic" };
  }
  if (current && current.amount !== amount) return { ok: false, error: "generic" };
  current ??= { identity: user.id, key: randomUUID(), amount };
  await save(current);
  try {
    const { data } = await patientApi<Recharge>("/wallet/recharges", {
      method: "POST", body: { amount_halalas: amount, payment_method: "myfatoorah" }, idempotencyKey: current.key,
    });
    const row = validate(data);
    if (row.amount_halalas !== amount) throw new Error("Recharge amount mismatch.");
    await save({ ...current, id: row.id });
    if (row.status !== "pending") return { ok: false, error: "generic" };
    return { ok: true, paymentUrl: paymentUrl(row.payment_url) };
  } catch (error) {
    if (error instanceof ZuwaraV2Error && [401, 403, 404, 422].includes(error.status)) (await cookies()).delete(COOKIE);
    if (error instanceof ZuwaraV2Error) return { ok: false, error: "generic" };
    throw error;
  }
}
export async function confirmRecharge(): Promise<boolean> {
  const current = await intent();
  if (!current?.id) return false;
  const { data } = await patientApi<Recharge>("/wallet/recharges/" + current.id + "/confirm", { method: "POST", body: {} });
  const row = validate(data);
  if (row.id !== current.id || row.amount_halalas !== current.amount) throw new Error("Recharge mismatch.");
  return row.status === "credited";
}
