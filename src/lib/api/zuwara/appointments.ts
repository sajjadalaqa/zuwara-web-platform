import "server-only";
import { cache } from "react";
import { patientApi } from "@/lib/auth/session";
import { halalas, pagination } from "@/lib/api/pagination";
export type AppointmentResource = {
  id: number; appointment_number: string; kind: string; status: { code: number; key: string };
  scheduled: { date: string; time: string; end_time: string; duration_minutes: number | null };
  consultation_type: string; doctor: { id: number; name: string; name_ar: string | null; image_url: string | null } | null;
  amount: { subtotal: string; discount: string; tax: string; payable_halalas: number; currency: string };
  problem: string | null; created_at: string; updated_at: string;
};
export function decimalHalalas(value: string): number {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value)) throw new Error("Invalid decimal amount.");
  const [whole, fraction = ""] = value.split(".");
  return halalas(Number(whole) * 100 + Number(fraction.padEnd(2, "0")));
}
export function startsAt(row: AppointmentResource): string {
  if (!row.scheduled?.date || !row.scheduled.time) return "";
  const match = /^(\d{2}):?(\d{2})(?::\d{2})?$/.exec(row.scheduled.time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(row.scheduled.date) || !match || Number(match[1]) > 23 || Number(match[2]) > 59) return "";
  const date = new Date(row.scheduled.date + "T" + match[1] + ":" + match[2] + ":00+03:00");
  if (!Number.isFinite(date.getTime())) return "";
  return date.toISOString();
}
export function validateAppointment(row: AppointmentResource) {
  if (!Number.isSafeInteger(row.id) || row.id < 1 || !row.appointment_number) throw new Error("Invalid appointment identity.");

  if (!Number.isInteger(row.status?.code) || row.status.code < 0 || row.status.code > 7) throw new Error("Invalid appointment status.");

  startsAt(row); halalas(row.amount.payable_halalas); return row;
}
export const allAppointments = cache(async (): Promise<AppointmentResource[]> => {
  const rows: AppointmentResource[] = [], seen = new Set<number>();
  for (let page = 1; page <= 100; page++) {
    const payload = await patientApi<AppointmentResource[]>("/appointments?per_page=50&page=" + page);
    const p = pagination(payload); let added = 0;
    for (const item of payload.data) { const row = validateAppointment(item); if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); added++; } }
    if (!p.has_more) return rows;
    if (!added) throw new Error("Invalid appointment pagination.");
  }
  throw new Error("Appointment pagination limit exceeded.");
});

export const upcomingAppointmentCount = cache(async () => {
  const rows = await allAppointments(), now = Date.now();
  return rows.filter(a => [0, 1, 5, 6].includes(a.status.code) && Date.parse(startsAt(a)) > now).length;
});




