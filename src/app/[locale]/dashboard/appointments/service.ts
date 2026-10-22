import "server-only";
import { cache } from "react";
import { patientApi } from "@/lib/auth/session";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import { allAppointments, startsAt, validateAppointment, decimalHalalas, type AppointmentResource } from "@/lib/api/zuwara/appointments";
import { halalas } from "@/lib/api/pagination";
import { STATUSES } from "./types";
import type { ActionResult, Appointment, AppointmentDetail, AppointmentFilters, AppointmentsResult, StatusFilter, TimelineKey } from "./types";
export const PAGE_SIZE = 6;
const statuses = ["pending", "accepted", "completed", "declined", "cancelled", "reopened", "reassigned", "unpaid"] as const;
function view(row: AppointmentResource, locale: string): Appointment {
  return { id: String(row.id), number: row.appointment_number, status: statuses[row.status.code],
    type: row.consultation_type === "online" ? "consultation" : "visit", startsAt: startsAt(row),
    durationMin: Number.isInteger(row.scheduled.duration_minutes) && Number(row.scheduled.duration_minutes) > 0 ? row.scheduled.duration_minutes : null, provider: { id: row.doctor ? String(row.doctor.id) : "",
      name: (locale === "ar" ? row.doctor?.name_ar : undefined) || row.doctor?.name || "—", specialty: "", avatarUrl: row.doctor?.image_url ?? undefined },
    price: halalas(row.amount.payable_halalas) / 100, currency: row.amount.currency,
    paymentStatus: row.status.code === 7 ? "unpaid" : "unknown" };
}
export async function getAppointments(filters: AppointmentFilters, locale: string): Promise<AppointmentsResult> {
  const q = filters.q.trim().toLocaleLowerCase(locale);
  const base = (await allAppointments()).map(row => view(row, locale))
    .filter(a => !q || [a.number, a.provider.name].some(v => v.toLocaleLowerCase(locale).includes(q)))
    .sort((a,b) => b.startsAt.localeCompare(a.startsAt) || Number(b.id) - Number(a.id));
  const counts = { all: base.length, ...Object.fromEntries(STATUSES.map(s => [s, base.filter(a => a.status === s).length])) } as Record<StatusFilter, number>;
  const filtered = filters.status === "all" ? base : base.filter(a => a.status === filters.status);
  const page = Math.min(Math.max(1, filters.page), Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  return { items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: filtered.length, page, pageSize: PAGE_SIZE, counts };
}
export async function cancelAppointment(id: string, key: string): Promise<ActionResult> {
  if (!/^[1-9]\d*$/.test(id) || !/^[a-f0-9-]{36}$/i.test(key)) return { ok: false, error: "not_found" };
  try {
    await patientApi("/appointments/" + id + "/cancel", { method: "POST", idempotencyKey: key, body: { reason: "Cancelled by patient through the website." } });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ZuwaraV2Error)) throw error;
    return { ok: false, error: error.status === 404 ? "not_found" : error.status === 409 ? "not_cancellable" : "generic" };
  }
}
export const getAppointment = cache(async (id: string, locale: string): Promise<AppointmentDetail | null> => {
  if (!/^[1-9]\d*$/.test(id)) return null;
  try {
    const [{ data }, { data: history }, { data: cancellation }] = await Promise.all([
      patientApi<AppointmentResource>("/appointments/" + id),
      patientApi<{ events: { action: string; new_status: number | null; created_at: string }[] }>("/appointments/" + id + "/timeline"),
      patientApi<{ eligible: boolean }>("/appointments/" + id + "/cancellation"),
    ]);
    const row = validateAppointment(data);
    if (row.id !== Number(id)) throw new Error("Appointment mismatch.");
    const timeline: AppointmentDetail["timeline"] = [];
    const keys: Record<number, TimelineKey> = { 0: "booked", 1: "accepted", 2: "completed", 3: "declined", 4: "cancelled", 5: "reopened", 6: "reassigned", 7: "unpaid" };
    for (const event of history.events) {
      const key = event.new_status === null ? undefined : keys[event.new_status];
      if (key && Number.isFinite(Date.parse(event.created_at))) timeline.push({ key, at: event.created_at });
    }
    if (!timeline.some(e => e.key === "booked") && Number.isFinite(Date.parse(row.created_at))) timeline.push({ key: "booked", at: row.created_at });
    timeline.sort((a,b) => a.at.localeCompare(b.at));
    const subtotal = decimalHalalas(row.amount.subtotal) - decimalHalalas(row.amount.discount);
    if (subtotal < 0) throw new Error("Invalid appointment amount.");
    let canJoin = false, videoUnavailable = false;
    if (row.consultation_type === "online") {
      try { canJoin = (await patientApi<{ can_join: boolean }>("/appointments/" + id + "/video")).data.can_join === true; }
      catch (error) { if (!(error instanceof ZuwaraV2Error)) throw error; videoUnavailable = true; }
    }
    return { ...view(row, locale), videoUnavailable, createdAt: row.created_at, notes: row.problem ?? undefined, cancellable: cancellation.eligible,
      meetingUrl: canJoin ? (locale === "ar" ? "/ar" : "") + "/dashboard/appointments/" + id + "/video" : undefined,
      timeline, payment: { method: "—", subtotal: decimalHalalas(row.amount.subtotal) / 100, discount: decimalHalalas(row.amount.discount) / 100, fee: decimalHalalas(row.amount.tax) / 100, total: halalas(row.amount.payable_halalas) / 100 } };
  } catch (error) { if (error instanceof ZuwaraV2Error && error.status === 404) return null; throw error; }
});
