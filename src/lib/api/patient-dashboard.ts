import "server-only";
import { patientApi } from "@/lib/auth/session";
import { d4hPatientApi } from "./d4h/patient";
import type { V2Envelope } from "./zuwara/v2";
export type Source = "zuwara" | "d4h";
export type Favorite = {
  id: number;
  name: string;
  name_ar?: string;
  photo?: string;
};
export type Review = {
  id: number;
  appointment_id?: number;
  booking_id?: number;
  consultant_id?: number;
  service_id?: number;
  rating: number;
  comment: string;
  created_at: string;
};
export type Complaint = {
  id: string;
  booking_id: number | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};
export type Document = {
  id: string;
  title: string;
  category: string;
  document_type: string;
  issuer: string;
  booking_id: number | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};
export type ServiceRequest = {
  id: number;
  title: string;
  description: string;
  status: string;
  service_ids: number[];
  preferred_date: string | null;
  created_at: string;
};
export type Address = {
  id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  long?: number;
  status?: number;
};
export type Loyalty = {
  points: number;
  referral_code: string | null;
  referral_enabled: boolean;
  referral_count: number;
  referrer_points: number;
  referred_user_points: number;
  max_referrals_per_user: number;
};
export function source(value: unknown): Source {
  if (value !== "zuwara" && value !== "d4h") throw Error("Choose an account.");
  return value;
}
export function numeric(value: unknown) {
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n < 1) throw Error("Invalid reference.");
  return n;
}
export function uuid(value: unknown) {
  const s = String(value);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  )
    throw Error("Invalid reference.");
  return s;
}
export function text(value: unknown, max: number, required = true) {
  const s = String(value ?? "").trim();
  if ((required && !s) || s.length > max)
    throw Error("Please check the required fields and length limits.");
  return s;
}
export function date(value: unknown, future = false) {
  const s = String(value ?? "");
  if (!s) return null;
  const d = new Date(s + "T00:00:00Z");
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(s) ||
    !Number.isFinite(+d) ||
    d.toISOString().slice(0, 10) !== s
  )
    throw Error("Invalid date.");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Riyadh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  if (future ? s < today : s > today)
    throw Error("Date is outside the allowed range.");
  return s;
}
export function request<T>(
  s: Source,
  path: string,
  options: Parameters<typeof patientApi<T>>[1] = {},
) {
  return s === "d4h"
    ? d4hPatientApi<T>(path, options)
    : patientApi<T>(path, options);
}
export async function list<T>(
  s: Source,
  path: string,
  page = 1,
): Promise<V2Envelope<T[]>> {
  const r = await request<T[]>(
    s,
    path +
      (path.includes("?") ? "&" : "?") +
      new URLSearchParams({
        page: String(Number.isSafeInteger(page) && page > 0 ? page : 1),
        per_page: "20",
      }),
  );
  if (!Array.isArray(r.data) || !r.meta?.pagination)
    throw Error("Invalid list response.");
  return r;
}
export function favorites(s: Source, page = 1) {
  return list<Favorite>(
    s,
    s === "d4h" ? "/favorites/providers" : "/favorites/consultants",
    page,
  );
}
export function reviewBody(rating: unknown, comment: unknown) {
  const n = Number(rating);
  if (
    !Number.isFinite(n) ||
    n < 1 ||
    n > 5 ||
    Math.abs(n * 100 - Math.round(n * 100)) > 0.000001
  )
    throw Error(
      "Rating must be between 1 and 5, with at most two decimal places.",
    );
  return { rating: n, comment: text(comment, 2000) };
}
export function addressBody(fd: FormData) {
  const address = text(fd.get("address"), 1000),
    lat = Number(fd.get("lat")),
    long = Number(fd.get("long"));
  if (
    !String(fd.get("lat") ?? "").trim() ||
    !String(fd.get("long") ?? "").trim() ||
    !Number.isFinite(lat) ||
    !Number.isFinite(long) ||
    lat < -90 ||
    lat > 90 ||
    long < -180 ||
    long > 180
  )
    throw Error("Enter valid latitude and longitude.");
  return { address, lat, long };
}
export function serviceBody(fd: FormData) {
  const service_ids = [...new Set(fd.getAll("service_ids").map(numeric))];
  if (service_ids.length < 1 || service_ids.length > 20)
    throw Error("Choose between 1 and 20 services.");
  return {
    title: text(fd.get("title"), 150),
    description: text(fd.get("description"), 5000),
    service_ids,
    preferred_date: date(fd.get("preferred_date"), true),
  };
}

export async function customServices() {
  const rows: { id: number; name: string }[] = [];
  const seen = new Set<number>();
  for (let page = 1; page <= 100; page++) {
    const result = await list<{ id: number; name: string }>(
      "d4h",
      "/catalog/services",
      page,
    );
    let added = 0;
    for (const row of result.data) {
      numeric(row.id);
      if (!seen.has(row.id)) {
        seen.add(row.id);
        rows.push({ id: row.id, name: row.name });
        added++;
      }
    }
    if (!result.meta?.pagination?.has_more) return rows;
    if (!added) throw Error("Invalid service pagination.");
  }
  throw Error("Service directory limit exceeded.");
}
