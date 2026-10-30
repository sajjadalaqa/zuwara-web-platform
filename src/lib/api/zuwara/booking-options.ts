/** Scheduled booking categories; catalogue communication channels are not aliases. */
export type BookingConsultationType = "online" | "clinic";

export function bookingConsultationOptions(advertised: readonly string[]): BookingConsultationType[] {
  return [...new Set(advertised)].filter((value): value is BookingConsultationType => value === "online" || value === "clinic");
}
