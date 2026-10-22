"use server";
import { unstable_rethrow } from "next/navigation";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { patientApi, requireSession } from "@/lib/auth/session";
import { seal, unseal } from "@/lib/auth/seal";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import {
  dateValue,
  numericId,
  knownCoupons,
  type TherapyCalendar,
  therapyCalendar,
} from "@/lib/api/zuwara/care";
import { consultantSlots } from "@/lib/api/zuwara/booking";
import { halalas } from "@/lib/api/pagination";
export type TherapyInput = {
  therapy_plan_id: number;
  doctor_id: number;
  patient_id: number | null;
  duration_minutes: number;
  consultation_type: string;
  problem: string;
  payment_method: "wallet" | "myfatoorah" | "tamara";
  sessions: { date: string; time: string }[];
};
export type RescheduleInput = {
  appointment_id: number;
  date: string;
  time: string;
  duration_minutes: number;
  reason: string;
  payment_method: "wallet" | "myfatoorah" | "tamara";
};
type Quote = {
  owner: string;
  kind: string;
  body: Record<string, unknown>;
  key: string;
  expires: number;
  resourceId: string;
};
export type PendingIntent = {
  token: string;
  resourceId: string;
  checkoutId?: string;
};
export type CareQuote = {
  token: string;
  service: number;
  discount?: number;
  tax: number;
  payable: number;
  currency: string;
  sessions?: {
    session_number: number;
    date: string;
    time: string;
    end_time: string;
  }[];
};
function secret() {
  const value = process.env.NEXT_SERVER_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Missing session secret.");
  return value;
}
function cookieName(kind: string) {
  if (kind !== "therapy" && !/^reschedule:[1-9]\d*$/.test(kind))
    throw new Error("Invalid intent.");
  return "zuwara_care_" + kind.replace(":", "_");
}
function time(value: string) {
  if (!/^(?:[01]\d|2[0-3])[0-5]\d$/.test(value))
    throw new Error("Invalid time.");
  return value;
}
function method(value: string) {
  if (!["wallet", "myfatoorah", "tamara"].includes(value))
    throw new Error("Invalid payment method.");
  return value;
}
async function readPending(kind: string, owner: string) {
  const value = (await cookies()).get(cookieName(kind))?.value;
  const saved = value
    ? unseal<PendingIntent & { owner: string }>(value, secret(), "care_pending")
    : null;
  return saved?.owner === owner ? saved : null;
}
async function savePending(
  kind: string,
  value: PendingIntent & { owner: string },
) {
  (await cookies()).set(
    cookieName(kind),
    boundedPending(value),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 86400,
    },
  );
}
function boundedPending(value:PendingIntent&{owner:string}) { const encrypted=seal(value,secret(),"care_pending"); if(encrypted.length>3800)throw new ZuwaraV2Error(422,"NOTES_TOO_LONG"); return encrypted; }
export async function pendingCareIntent(
  kind: string,
): Promise<PendingIntent | null> {
  const { user } = await requireSession();
  const value = await readPending(kind, user.id);
  return value
    ? {
        token: value.token,
        resourceId: value.resourceId,
        checkoutId: value.checkoutId,
      }
    : null;
}
function failure(error: unknown) {
  unstable_rethrow(error);
  const definitive =
    error instanceof ZuwaraV2Error &&
    (error.status === 422 ||
      [
        "SLOT_UNAVAILABLE",
        "INSUFFICIENT_WALLET",
        "INVALID_PATIENT",
        "INVALID_THERAPY_SELECTION",
        "INVALID_SESSION_ORDER",
        "PLAN_NOT_ENABLED",
        "APPOINTMENT_LIMIT",
        "THERAPY_SCOPE_UNAVAILABLE",
        "GATEWAY_SCOPE_UNSUPPORTED",
      ].includes(error.code));
  return {
    ok: false as const,
    uncertain: !definitive,
    error: error instanceof ZuwaraV2Error ? error.code : "REQUEST_UNCONFIRMED",
  };
}
async function makeQuote(
  kind: string,
  body: Record<string, unknown>,
  resourceId: string,
) {
  const { user } = await requireSession();
  if (await readPending(kind, user.id))
    throw new Error("Resolve the previous request first.");
  const quote = {
    owner: user.id,
    kind,
    body,
    key: randomUUID(),
    expires: Date.now() + 30 * 60000,
    resourceId,
  };
  const token = seal(quote, secret(), "care_quote");
  const pending = seal({owner:user.id,token,resourceId},secret(),"care_pending");
  if(pending.length>3400)throw new ZuwaraV2Error(422,"NOTES_TOO_LONG");
  return quote;
}
export async function therapySlotsAction(
  plan: string,
  doctor: string,
  duration: number,
  date: string,
): Promise<{ ok: true; calendar: TherapyCalendar } | { ok: false }> {
  try {
    return {
      ok: true,
      calendar: await therapyCalendar(plan, doctor, duration, date),
    };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false };
  }
}
export async function previewTherapyAction(input: TherapyInput) {
  try {
    numericId(input.therapy_plan_id);
    numericId(input.doctor_id);
    if (input.patient_id !== null) numericId(input.patient_id);
    if (
      ![15, 30, 45, 60].includes(input.duration_minutes) ||
      !Array.isArray(input.sessions) ||
      !input.sessions.length ||
      input.sessions.length > 20 ||
      typeof input.problem !== "string" ||
      !input.problem.trim() ||
      input.problem.length > 4000 ||
      !/^[a-z_]{1,30}$/.test(input.consultation_type)
    )
      throw new Error("Invalid therapy selection.");
    const body = {
      therapy_plan_id: input.therapy_plan_id,
      doctor_id: input.doctor_id,
      patient_id: input.patient_id,
      duration_minutes: input.duration_minutes,
      consultation_type: input.consultation_type,
      problem: input.problem.trim(),
      payment_method: method(input.payment_method),
      sessions: input.sessions.map((s) => ({
        date: dateValue(s.date),
        time: time(s.time),
      })),
    };
    const quote = await makeQuote(
      "therapy",
      body,
      String(input.therapy_plan_id),
    );
    const { data } = await patientApi<{
      service_amount_halalas: number;
      tax_halalas: number;
      payable_halalas: number;
      currency: string;
      slot_reserved: boolean;
      sessions: NonNullable<CareQuote["sessions"]>;
    }>("/therapy-bookings/preview", { method: "POST", body });
    if (
      data.slot_reserved !== false ||
      data.currency !== "SAR" ||
      !Array.isArray(data.sessions)
    )
      throw new Error("Invalid therapy preview.");
    return {
      ok: true as const,
      quote: {
        token: seal(quote, secret(), "care_quote"),
        service: halalas(data.service_amount_halalas),
        tax: halalas(data.tax_halalas),
        payable: halalas(data.payable_halalas),
        currency: data.currency,
        sessions: data.sessions,
      } satisfies CareQuote,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function rescheduleSlotsAction(
  id: number,
  doctor: number,
  plan: number | null,
  duration: number,
  date: string,
) {
  try {
    await requireSession();
    numericId(id);
    if (plan) {
      const calendar = await therapyCalendar(
        String(plan),
        String(doctor),
        duration,
        date,
      );
      return {
        ok: true as const,
        slots:
          calendar.dates
            .find((day) => day.date === date && day.is_available)
            ?.slots.map((slot) => slot.start_time) || [],
      };
    }
    return {
      ok: true as const,
      slots: await consultantSlots(doctor, date, duration),
    };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false as const };
  }
}
export async function previewRescheduleAction(input: RescheduleInput) {
  try {
    const id = numericId(input.appointment_id);
    if (
      ![15, 30, 45, 60].includes(input.duration_minutes) ||
      typeof input.reason !== "string" ||
      !input.reason.trim() ||
      input.reason.length > 4000
    )
      throw new Error("Invalid request.");
    const body = {
      date: dateValue(input.date),
      time: time(input.time),
      duration_minutes: input.duration_minutes,
      reason: input.reason.trim(),
      payment_method: method(input.payment_method),
    };
    const quote = await makeQuote("reschedule:" + id, body, id);
    const { data } = await patientApi<{
      charge_halalas: number;
      currency: string;
      old?: unknown;
      new?: unknown;
      pricing?: unknown;
    }>("/appointments/" + id + "/reschedule/preview", {
      method: "POST",
      body: {
        date: body.date,
        time: body.time,
        duration_minutes: body.duration_minutes,
        reason: body.reason,
      },
    });
    if (data.currency !== "SAR")
      throw new Error("Invalid reschedule currency.");
    return {
      ok: true as const,
      quote: {
        token: seal(quote, secret(), "care_quote"),
        service: halalas(data.charge_halalas),
        tax: 0,
        payable: halalas(data.charge_halalas),
        currency: data.currency,
      } satisfies CareQuote,
    };
  } catch (error) {
    return failure(error);
  }
}
export async function prepareCareAction(kind: string, token: string) {
  const { user } = await requireSession();
  if (typeof token !== "string" || token.length > 24000)
    return { ok: false as const, error: "INVALID_INTENT" };
  const quote = unseal<Quote>(token, secret(), "care_quote");
  if (!quote || quote.owner !== user.id || quote.kind !== kind)
    return { ok: false as const, error: "INVALID_INTENT" };
  const saved = await readPending(kind, user.id);
  if (saved && saved.token !== token)
    return { ok: false as const, error: "PREVIOUS_REQUEST_PENDING" };
  if (!saved && quote.expires < Date.now())
    return { ok: false as const, error: "PREVIEW_EXPIRED" };
  if (!saved)
    await savePending(kind, {
      owner: user.id,
      token,
      resourceId: quote.resourceId,
    });
  return { ok: true as const };
}
export async function submitCareAction(kind: string, token: string) {
  const { user } = await requireSession();
  if (typeof token !== "string" || token.length > 24000)
    return { ok: false as const, uncertain: false, error: "INVALID_INTENT" };
  const quote = unseal<Quote>(token, secret(), "care_quote");
  if (!quote || quote.owner !== user.id || quote.kind !== kind)
    return { ok: false as const, uncertain: false, error: "INVALID_INTENT" };
  const saved = await readPending(kind, user.id);
  if (saved && saved.token !== token)
    return {
      ok: false as const,
      uncertain: true,
      error: "PREVIOUS_REQUEST_PENDING",
    };
  if (!saved)
    return { ok: false as const, uncertain: false, error: "PREPARE_REQUIRED" };
  await savePending(kind, {
    owner: user.id,
    token,
    resourceId: quote.resourceId,
    checkoutId: saved?.checkoutId,
  });
  try {
    if (kind === "therapy") {
      const { data } = await patientApi<{
        session_group_id: string;
        requires_payment: boolean;
        sessions: { id: number }[];
      }>("/therapy-bookings", {
        method: "POST",
        body: quote.body,
        idempotencyKey: quote.key,
      });
      if (
        !/^[a-f0-9-]{36}$/i.test(data.session_group_id) ||
        !Array.isArray(data.sessions) ||
        !data.sessions.length ||
        typeof data.requires_payment !== "boolean"
      )
        throw new Error("Invalid booking confirmation.");
      (await cookies()).delete(cookieName(kind));
      return { ok: true as const, group: data.session_group_id };
    }
    const id = numericId(quote.resourceId);
    if (kind !== "reschedule:" + id)
      throw new Error("Invalid reschedule intent.");
    const { data } = await patientApi<{
      request?: { id: number };
      checkout?: { id: string };
      requires_payment?: boolean;
    }>("/appointments/" + id + "/reschedule-requests", {
      method: "POST",
      body: quote.body,
      idempotencyKey: quote.key,
    });
    if (data.requires_payment && data.checkout?.id) {
      const checkout = String(data.checkout.id);
      if (!/^[a-zA-Z0-9-]{1,100}$/.test(checkout))
        throw new Error("Invalid checkout.");
      await savePending(kind, {
        owner: user.id,
        token,
        resourceId: id,
        checkoutId: checkout,
      });
      return { ok: true as const, checkout };
    }
    if (!data.request?.id) throw new Error("Request not confirmed.");
    (await cookies()).delete(cookieName(kind));
    return { ok: true as const, requestId: data.request.id };
  } catch (error) {
    const result = failure(error);
    if (!result.uncertain && !saved?.checkoutId)
      (await cookies()).delete(cookieName(kind));
    return result;
  }
}
export async function respondRescheduleAction(
  id: string,
  decision: "approve" | "reject",
  reason: string,
) {
  try {
    numericId(id);
    if (
      !["approve", "reject"].includes(decision) ||
      typeof reason !== "string" ||
      reason.length > 4000 ||
      (decision === "reject" && !reason.trim())
    )
      throw new Error("Invalid response.");
    await patientApi("/reschedule-requests/" + id + "/respond", {
      method: "POST",
      body: {
        decision,
        ...(decision === "reject" ? { reason: reason.trim() } : {}),
      },
    });
    return { ok: true as const };
  } catch (error) {
    return failure(error);
  }
}
export async function findCouponAction(code: string) {
  try {
    const result = await knownCoupons(code);
    return {
      ok: true as const,
      coupons: result.items.map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code,
        percentage: row.percentage,
        minimum_amount_halalas: row.minimum_amount_halalas,
        maximum_discount_halalas: row.maximum_discount_halalas,
        expires_at: row.expires_at,
        requires_booking_preview: row.requires_booking_preview,
      })),
    };
  } catch (error) {
    unstable_rethrow(error);
    return { ok: false as const };
  }
}
