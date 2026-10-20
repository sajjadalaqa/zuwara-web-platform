// src/app/[locale]/provider/[id]/book/booking-api.ts

export type BookingPayload = {
  providerId: string | number;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM (24h)
  visitType: "home" | "virtual";
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  notes?: string;
};

/** Booking creation requires a saved address, selected services, and a server preview. */
export async function submitBooking(payload: BookingPayload): Promise<{ ok: boolean }> {
  void payload;
  // Do not show a confirmation until the D4H booking/preview flow is connected.
  return { ok: false };
}