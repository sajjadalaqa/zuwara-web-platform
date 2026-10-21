import "server-only";
import { randomUUID } from "node:crypto";
import { patientApi, requireSession } from "@/lib/auth/session";
import { seal, unseal } from "@/lib/auth/seal";
import { halalas } from "@/lib/api/pagination";
export type BookingInput = { doctor_id: number; patient_id: number | null; date: string; time: string; duration_minutes: number; consultation_type: string; problem: string; payment_method: "wallet" | "myfatoorah" | "tamara" };
export type BookingDoctor = { id: number; name: string; name_ar: string | null; consultation_types: string[]; duration_options: { minutes: number; price_halalas: number }[] };
export async function bookingDoctor(id: string) {
  if (!/^[1-9]\d*$/.test(id)) throw new Error("Invalid consultant.");
  return (await patientApi<BookingDoctor>("/consultants/" + id)).data;
}
function validate(input: BookingInput) {
  if (!Number.isSafeInteger(input.doctor_id) || input.doctor_id < 1 ||
      input.patient_id !== null && (!Number.isSafeInteger(input.patient_id) || input.patient_id < 1) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^(?:[01]\d|2[0-3])[0-5]\d$/.test(input.time) ||
      !Number.isSafeInteger(input.duration_minutes) || input.duration_minutes < 1 || input.duration_minutes > 480 ||
      !/^[a-z_]{1,30}$/.test(input.consultation_type) || typeof input.problem !== "string" || input.problem.length > 4000 ||
      !["wallet", "myfatoorah", "tamara"].includes(input.payment_method)) throw new Error("Invalid booking selection.");
  return { doctor_id: input.doctor_id, patient_id: input.patient_id, date: input.date, time: input.time,
    duration_minutes: input.duration_minutes, consultation_type: input.consultation_type, problem: input.problem.trim(), payment_method: input.payment_method };
}
function secret() { const key = process.env.NEXT_SERVER_SESSION_SECRET; if (!key || key.length < 32) throw new Error("Missing session secret."); return key; }
type Quote = { identity: string; input: BookingInput; key: string; expires: number; payable: number };
export async function previewBooking(input: BookingInput) {
  const { user } = await requireSession();
  const clean = validate(input);
  const { data } = await patientApi<{ pricing: { payable: { halalas: number }; currency: string }; can_create: boolean; slot_reserved: boolean }>("/appointments/preview", { method: "POST", body: clean });
  if (data.can_create !== true || data.slot_reserved !== false) throw new Error("Booking cannot be created.");
  const payable = halalas(data.pricing?.payable?.halalas);
  if (data.pricing.currency !== "SAR") throw new Error("Invalid quote currency.");
  const quote: Quote = { identity: user.id, input: clean, key: randomUUID(), expires: Date.now() + 30 * 60_000, payable };
  return { token: seal(quote, secret(), "zuwara_booking"), payableHalalas: payable, currency: "SAR" };
}
export async function createBooking(token: string) {
  const { user } = await requireSession();
  if (typeof token !== "string" || token.length > 15000) throw new Error("Invalid booking quote.");
  const quote = unseal<Quote>(token, secret(), "zuwara_booking");
  if (!quote || quote.identity !== user.id || quote.expires < Date.now()) throw new Error("Booking quote expired.");
  const input = validate(quote.input);
  const { data } = await patientApi<{ appointment: { id: number }; requires_payment: boolean }>("/appointments", { method: "POST", body: input, idempotencyKey: quote.key });
  if (!Number.isSafeInteger(data.appointment?.id) || data.appointment.id < 1 || typeof data.requires_payment !== "boolean") throw new Error("Invalid booking confirmation.");
  return { id: data.appointment.id, requiresPayment: data.requires_payment, paymentMethod: input.payment_method };
}
export async function consultantSlots(id: number, date: string, duration: number) {
  if (!Number.isSafeInteger(id) || id < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isSafeInteger(duration) || duration < 1 || duration > 480) throw new Error("Invalid slot request.");
  const { data } = await patientApi<{ dates: { date: string; is_available: boolean; slots: { start_time: string; end_time: string }[] }[] }>(
    "/consultants/" + id + "/availability?" + new URLSearchParams({ start_date: date, duration_minutes: String(duration), days: "1" }));
  if (!Array.isArray(data.dates)) throw new Error("Invalid availability.");
  const day = data.dates.find(d => d.date === date);
  return day?.is_available ? day.slots.map(slot => {
    if (!/^(?:[01]\d|2[0-3])[0-5]\d$/.test(slot.start_time)) throw new Error("Invalid available time.");
    return slot.start_time;
  }) : [];
}

