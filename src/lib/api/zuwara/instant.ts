import "server-only";
import { patientApi } from "@/lib/auth/session";

export type InstantType = "public" | "private";
export type PaymentMethod = "wallet" | "myfatoorah" | "tamara";
export type Pricing = { currency: string; service_amount: string; discount_amount: string; subtotal: string; total_tax_amount: string; payable_amount: string; [key: string]: unknown };
export type InstantCheckout = { checkout_id: string; gateway: "myfatoorah" | "tamara"; status: string; paid: boolean; amount: string; currency: string; session_id: string | null; checkout_url: string | null; integration_mode: string; appointment_id: number | null; [key: string]: unknown };
export type InstantRequest = {
  request_uuid: string; type: InstantType; request_status: "pending_payment" | "pending" | "accepted_awaiting_payment" | "accepted" | "declined_all" | "expired" | "cancelled";
  consultation_type: "online"; communication_type: "video" | "audio" | "chat";
  patient_id: number | null; doctor_id: number | null; duration_id: number; duration_minutes: number; appointment_id: number | null;
  paid: boolean; pricing_summary: Pricing | null; checkout: InstantCheckout | null; can_pay: boolean; can_cancel: boolean; can_retry: boolean;
  attempts_used: number; max_attempts: number; retry_window_hours: number; refund_status: string;
  timer_type: "doctor_response" | "payment" | null; timer_expires_at: string | null; timer_duration_minutes: number | null; timer_duration_seconds: number | null;
  seconds_remaining: number; server_time: string; replayed?: boolean; [key: string]: unknown;
};
export type InstantSettings = { enabled: boolean; durations: { id: number; minutes: number; service_price_halalas: number; currency: string }[]; doctor_response_minutes: number; private_payment_minutes: number; max_private_attempts: number; private_retry_window_hours: number };
export type HistoryCard = Pick<InstantRequest, "request_uuid" | "type" | "request_status" | "paid" | "appointment_id" | "duration_minutes"> & { created_at: string };
export type InstantInput = { duration_id: number; consultation_type: "online"; communication_type?: "video" | "audio" | "chat"; doctor_id?: number; patient_id?: number; category_id?: number; gender_preference?: "male" | "female" | "both"; interests?: number[]; coupon_id?: number; coupon_code?: string; problem?: string; payment_method?: PaymentMethod; wallet_recharge_id?: number };
const base = "/instant-appointments";
export function instantId(value: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) throw new Error("Invalid instant identifier.");
  return value;
}
function key(value: string) { if (!/^[A-Za-z0-9_.:-]{8,100}$/.test(value)) throw new Error("Invalid operation key."); return value; }
function payment(input: Partial<InstantInput>) {
  if (!["wallet", "myfatoorah", "tamara"].includes(input.payment_method ?? "")) throw new Error("Select a payment method.");
  if (input.payment_method === "myfatoorah" && process.env.INSTANT_MYFATOORAH_WEB_ENABLED !== "true") throw new Error("Instant card payments are not enabled.");
  if (Boolean(input.coupon_id) !== Boolean(input.coupon_code)) throw new Error("Both coupon ID and code are required.");
  for (const value of [input.coupon_id, input.wallet_recharge_id]) if (value !== undefined && (!Number.isSafeInteger(value) || value < 1)) throw new Error("Invalid payment reference.");
  if (input.wallet_recharge_id !== undefined && input.payment_method !== "wallet") throw new Error("Recharge references require wallet payment.");
  return { payment_method: input.payment_method, coupon_id: input.coupon_id, coupon_code: input.coupon_code, wallet_recharge_id: input.wallet_recharge_id };
}
function quoteInput(type: InstantType, input: InstantInput) {
  if (!["public", "private"].includes(type) || !Number.isSafeInteger(input.duration_id) || input.duration_id < 1 || input.consultation_type !== "online") throw new Error("Invalid instant selection.");
  if (type === "private" && (!Number.isSafeInteger(input.doctor_id) || input.doctor_id! < 1)) throw new Error("Select a consultant.");
  if (input.communication_type && !["video", "audio", "chat"].includes(input.communication_type)) throw new Error("Invalid communication type.");
  for (const value of [input.patient_id, input.category_id]) if (value !== undefined && (!Number.isSafeInteger(value) || value < 1)) throw new Error("Invalid selection.");
  if (input.interests && (input.interests.length > 20 || new Set(input.interests).size !== input.interests.length || input.interests.some(id => !Number.isSafeInteger(id) || id < 1))) throw new Error("Invalid interests.");
  if (input.gender_preference && !["male", "female", "both"].includes(input.gender_preference)) throw new Error("Invalid preference.");
  if (type === "public" && Boolean(input.coupon_id) !== Boolean(input.coupon_code)) throw new Error("Both coupon ID and code are required.");
  return { duration_id: input.duration_id, consultation_type: "online", communication_type: input.communication_type ?? "video", patient_id: input.patient_id,
    ...(type === "private" ? { doctor_id: input.doctor_id } : { category_id: input.category_id, gender_preference: input.gender_preference, interests: input.interests, coupon_id: input.coupon_id, coupon_code: input.coupon_code }) };
}
export const instantSettings = () => patientApi<InstantSettings>(base + "/durations");
export const activeInstant = () => patientApi<InstantRequest | null>(base + "/active");
export const readInstant = (uuid: string) => patientApi<InstantRequest>(base + "/" + instantId(uuid));
export function instantHistory(page = 1) {
  if (!Number.isSafeInteger(page) || page < 1) throw new Error("Invalid page.");
  return patientApi<HistoryCard[]>(base + "?per_page=20&page=" + page);
}
export function previewInstant(type: InstantType, input: InstantInput) { return patientApi<{ type: InstantType; pricing_summary: Pricing; charge_now: boolean; slot_reserved: false; requires_revalidation: true }>(base + "/" + type + "/preview", { method: "POST", body: quoteInput(type, input) }); }
export function createInstant(type: InstantType, input: InstantInput, operationKey: string) {
  const body = quoteInput(type, input);
  if (typeof input.problem !== "string" || !input.problem.trim() || input.problem.length > 555) throw new Error("Describe your concern in 555 characters or fewer.");
  return patientApi<InstantRequest>(base + "/" + type, { method: "POST", idempotencyKey: key(operationKey), body: { ...body, problem: input.problem, ...(type === "public" ? payment(input) : {}) } });
}
export function payInstant(uuid: string, input: Partial<InstantInput>, operationKey: string) { return patientApi<InstantRequest>(base + "/" + instantId(uuid) + "/pay", { method: "POST", body: payment(input), idempotencyKey: key(operationKey) }); }
export function cancelInstant(uuid: string, operationKey: string) { return patientApi<InstantRequest>(base + "/" + instantId(uuid) + "/cancel", { method: "POST", body: {}, idempotencyKey: key(operationKey) }); }
export function instantCheckout(uuid: string, checkout: string, command?: "session" | "confirm", paymentId?: string) {
  if (command && !["session", "confirm"].includes(command)) throw new Error("Invalid checkout operation.");
  if (paymentId !== undefined && (typeof paymentId !== "string" || !paymentId.trim() || paymentId.length > 200)) throw new Error("Invalid payment reference.");
  return patientApi<InstantCheckout>(base + "/" + instantId(uuid) + "/checkouts/" + instantId(checkout) + (command ? "/" + command : ""), command ? { method: "POST", body: command === "confirm" && paymentId ? { payment_id: paymentId } : {} } : {});
}
