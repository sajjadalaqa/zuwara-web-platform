import "server-only";
import { patientApi, requireSession } from "@/lib/auth/session";
import { pagination, halalas } from "@/lib/api/pagination";
export type Bilingual = { en: string | null; ar: string | null };
export type Plan = {
  id: number;
  title: Bilingual;
  image_url: string | null;
  total_sessions: number;
  sessions_recommended: boolean;
  description?: Bilingual;
  durations?: {
    duration_minutes: number;
    price_per_session_halalas: number;
    currency: string;
  }[];
  milestones?: PlanItem[];
  goals?: PlanItem[];
  faqs?: { id: number; question: Bilingual; answer: Bilingual }[];
};
export type PlanItem = { id: number; title: Bilingual; description: Bilingual };
export type PlanDoctor = {
  id: number;
  name: Bilingual;
  image_url: string | null;
};
export type Selection = {
  date: string;
  time: string;
  duration_minutes: number;
};
export type Reschedule = {
  id: number;
  appointment_id: number;
  appointment_number?: string;
  kind: string;
  session_group_id: string | null;
  doctor_id: number;
  requested_by: string;
  status: string;
  requested: Selection;
  previous: Selection;
  duration_change: string;
  payment: {
    extra_paid_halalas: number;
    credit_used_halalas: number;
    required_upgrade_halalas: number;
    has_extra_payment: boolean;
    currency: string;
    method: string | null;
    automatic_refund_on_rejection: boolean;
  };
  reason: string | null;
  reject_reason: string | null;
  created_at: string;
  updated_at: string;
};
export type ClinicalSummary = {
  plan?: string | null;
  subject?: string | null;
  objective?: string | null;
  assessment?: string | null;
  diagnosed_with?: string | null;
  instructions_followup?: string | null;
};
export type FollowUp = {
  id: string;
  appointment_id: number;
  workflow: string;
  status: string;
  status_label: string;
  status_label_ar: string;
  scheduled_at: string;
  available_until: string;
  duration_minutes: number;
  can_join: boolean;
  can_complete: boolean;
  completed_at: string | null;
  closed_at: string | null;
  close_reason: string | null;
  notes: string | null;
  summary_changed: boolean;
  original_summary: ClinicalSummary | null;
  follow_up_summary: ClinicalSummary | null;
  effective_summary: ClinicalSummary | null;
};
export type ReviewWorkflow = {
  appointment_id: number;
  follow_up: {
    eligible: boolean;
    reason: string | null;
    completed_at: string | null;
    schedule_by: string | null;
    duration_minutes: number;
    follow_up: { id: string } | null;
  };
  reopen: {
    eligible_for_consultant: boolean;
    used: boolean;
    completed: boolean;
    ends_at: string | null;
    active: boolean;
  };
  patient_can_schedule_follow_up: boolean;
  patient_can_reopen: boolean;
  patient_can_complete_review: boolean;
};
export type Coupon = {
  id: number;
  name: string;
  code: string;
  percentage: number;
  minimum_amount_halalas: number;
  maximum_discount_halalas: number;
  expires_at: string | null;
  requires_booking_preview: boolean;
};
export type Contract = {
  id: number;
  name: string;
  number: string;
  start_date: string | null;
  end_date: string | null;
  patient_booking_supported: boolean;
};
export type CarePage<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  hasMore: boolean;
};
export function numericId(value: string | number): string {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s) || !Number.isSafeInteger(Number(s)))
    throw new Error("Invalid resource ID.");
  return s;
}
export function uuid(value: string): string {
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      value,
    )
  )
    throw new Error("Invalid resource reference.");
  return value.toLowerCase();
}
export function dateValue(value: string): string {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value + "T00:00:00Z"))
  )
    throw new Error("Invalid date.");
  return value;
}
export async function careList<T>(
  path: string,
  page = 1,
  query = new URLSearchParams(),
): Promise<CarePage<T>> {
  await requireSession();
  const params = new URLSearchParams(query);
  params.set("page", String(Number.isSafeInteger(page) && page > 0 ? page : 1));
  params.set("per_page", "12");
  const payload = await patientApi<T[]>(path + "?" + params),
    p = pagination(payload);
  return {
    items: payload.data,
    page: p.current_page,
    perPage: p.per_page,
    total: p.total,
    hasMore: p.has_more,
  };
}
export async function planDetails(id: string) {
  const { data } = await patientApi<Plan>("/therapy-plans/" + numericId(id));
  if (data.id !== Number(id) || !data.title || !Array.isArray(data.durations))
    throw new Error("Invalid therapy plan.");
  data.durations.forEach((d) => halalas(d.price_per_session_halalas));
  return data;
}
export async function planDoctors(id: string) {
  const rows: PlanDoctor[] = [],
    seen = new Set<number>();
  for (let page = 1; page <= 100; page++) {
    const payload = await patientApi<PlanDoctor[]>(
        "/therapy-plans/" +
          numericId(id) +
          "/consultants?per_page=50&page=" +
          page,
      ),
      p = pagination(payload);
    let added = 0;
    for (const row of payload.data) {
      numericId(row.id);
      if (!row.name) throw new Error("Invalid consultant.");
      if (!seen.has(row.id)) {
        seen.add(row.id);
        rows.push({ id: row.id, name: row.name, image_url: row.image_url });
        added++;
      }
    }
    if (!p.has_more) return rows;
    if (!added) throw new Error("Invalid consultant pagination.");
  }
  throw new Error("Consultant limit exceeded.");
}
export type TherapyCalendar = {
  duration_enabled: boolean;
  price_halalas: number;
  currency: string;
  dates: {
    date: string;
    status: string;
    is_available: boolean;
    slots: { start_time: string; end_time: string; period: string }[];
  }[];
};
export async function therapyCalendar(
  plan: string,
  doctor: string,
  duration: number,
  date: string,
) {
  if (![15, 30, 45, 60].includes(duration))
    throw new Error("Invalid duration.");
  const { data } = await patientApi<TherapyCalendar>(
    "/therapy-plans/" +
      numericId(plan) +
      "/consultants/" +
      numericId(doctor) +
      "/availability?" +
      new URLSearchParams({
        duration_minutes: String(duration),
        start_date: dateValue(date),
        days: "7",
      }),
  );
  if (!Array.isArray(data.dates)) throw new Error("Invalid therapy calendar.");
  halalas(data.price_halalas);
  return data;
}
export async function followUpDetails(id: string) {
  return (await patientApi<FollowUp>("/follow-ups/" + uuid(id))).data;
}
export async function reviewWorkflow(id: string) {
  return (
    await patientApi<ReviewWorkflow>(
      "/appointments/" + numericId(id) + "/review-workflow",
    )
  ).data;
}
export async function knownCoupons(code: string) {
  const clean = code.trim();
  if (!clean || clean.length > 100) throw new Error("Invalid coupon code.");
  return careList<Coupon>("/coupons", 1, new URLSearchParams({ code: clean }));
}
