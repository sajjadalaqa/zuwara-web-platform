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

/**
 * PLACEHOLDER: this does NOT save anything yet.
 * Replace the body with your real booking endpoint, for example:
 *
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/bookings`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(payload),
 *   });
 *   return { ok: res.ok };
 */
export async function submitBooking(payload: BookingPayload): Promise<{ ok: boolean }> {
  void payload;
  await new Promise((r) => setTimeout(r, 700));
  return { ok: true };
}