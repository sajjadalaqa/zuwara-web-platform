import "server-only";
import { patientApi } from "@/lib/auth/session";
export type Checkout = { checkout_id: string; appointment_id: number; status: string; paid: boolean; amount: string | number; currency: string; session_id: string | null; checkout_url: string | null; payment_method?: string };
function id(value: string) { if (!/^[A-Za-z0-9-]{1,100}$/.test(value)) throw new Error("Invalid checkout."); return value; }
function checkout(data: Checkout) {
  if (!data.checkout_id || !Number.isSafeInteger(data.appointment_id) || data.appointment_id < 1 || typeof data.paid !== "boolean" ||
      data.currency !== "SAR" || !Number.isFinite(Number(data.amount)) || Number(data.amount) < 0) throw new Error("Invalid checkout response.");
  id(data.checkout_id); return { checkout_id: data.checkout_id, appointment_id: data.appointment_id, status: data.status, paid: data.paid,
    amount: data.amount, currency: data.currency, session_id: data.session_id, checkout_url: data.checkout_url, payment_method: data.payment_method };
}
export function checkoutUrl(value: string) {
  const url = new URL(value);
  const approved = url.hostname === "tamara.co" || url.hostname.endsWith(".tamara.co") ||
    ["demo.myfatoorah.com", "sa.myfatoorah.com", "portal.myfatoorah.com"].includes(url.hostname);
  if (!approved || url.protocol !== "https:" || url.username || url.password || url.port) throw new Error("Invalid checkout destination.");
  return url.href;
}
export async function readCheckout(checkoutId: string) {
  const { data } = await patientApi<Checkout>("/checkouts/" + id(checkoutId));
  const row = checkout(data);
  if (row.checkout_id !== checkoutId) throw new Error("Checkout mismatch.");
  return row;
}
export async function startCheckout(appointmentId: string, method: string) {
  if (!/^[1-9]\d*$/.test(appointmentId) || !["myfatoorah", "tamara"].includes(method)) throw new Error("Invalid payment selection.");
  const { data } = await patientApi<Checkout>("/appointments/" + appointmentId + "/checkout", { method: "POST", body: { payment_method: method } });
  return checkout(data);
}
export async function checkoutSession(checkoutId: string) {
  const before = await readCheckout(checkoutId);
  if (before.paid || before.status === "review_required") throw new Error("Checkout cannot accept another payment.");
  const { data } = await patientApi<Checkout>("/checkouts/" + id(checkoutId) + "/session", { method: "POST", body: {} });
  const row = checkout(data);
  if (row.checkout_id !== checkoutId || row.paid || row.status === "review_required" || !row.session_id) throw new Error("Invalid payment session.");
  return { sessionId: row.session_id };
}
export async function confirmCheckout(checkoutId: string, paymentId?: string) {
  if (paymentId !== undefined && !/^[A-Za-z0-9_-]{1,256}$/.test(paymentId)) throw new Error("Invalid payment reference.");
  await patientApi("/checkouts/" + id(checkoutId) + "/confirm", { method: "POST", body: paymentId ? { payment_id: paymentId } : {} });
  return readCheckout(checkoutId);
}


