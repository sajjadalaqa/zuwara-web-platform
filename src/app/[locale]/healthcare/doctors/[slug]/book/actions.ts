"use server";
import { createBooking, previewBooking, consultantSlots, type BookingInput } from "@/lib/api/zuwara/booking";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
export async function slotsAction(id: number, date: string, duration: number) {
  return consultantSlots(id, date, duration);
}
export async function previewAction(input: BookingInput) {
  if (input?.consultation_type !== "online" && input?.consultation_type !== "clinic") {
    return { ok: false as const, code: "VALIDATION_FAILED", fields: ["consultation_type"], requestId: undefined, typeHint: undefined };
  }
  try { return { ok: true as const, quote: await previewBooking(input) }; }
  catch (error) {
    if (error instanceof ZuwaraV2Error) {
      return { ok: false as const, code: error.code, requestId: error.requestId, fields: error.validationFields, typeHint: error.consultationTypeHint };
    }
    throw error;
  }
}
export async function createBookingAction(token: string) {
  try { return { ok: true as const, booking: await createBooking(token) }; }
  catch (error) {
    if (error instanceof ZuwaraV2Error) {
      const rejected = error.status === 422 || ["SLOT_UNAVAILABLE", "INSUFFICIENT_WALLET", "APPOINTMENT_LIMIT", "GATEWAY_SCOPE_UNSUPPORTED", "CONTRACT_BOOKING_REQUIRED", "INVALID_PATIENT", "COUPON_UNAVAILABLE"].includes(error.code);
      return { ok: false as const, uncertain: !rejected };
    }
    throw error;
  }
}
