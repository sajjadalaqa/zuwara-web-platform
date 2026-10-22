import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import { readSession } from "@/lib/auth/session";
import { zuwaraV2 } from "./v2";
import { pagination } from "@/lib/api/pagination";
import type { ZuwaraCategory, ZuwaraDoctor } from "./types";
export type V2Doctor = {
  id: number; doctor_number: string; name: string; name_ar: string | null; image_url: string | null;
  designation: string | null; designation_ar: string | null; experience_years: number; rating: number; patients_served: number;
  photo?: string | null; biography?: string | null; rating_count?: number; reviews_count?: number; accepts_instant?: { public: boolean; private: boolean };
  service_locations?: { id: number; title: string; title_ar: string | null; address: string | null; address_ar: string | null }[];
  starting_price: string; currency: string; category: { id: number; title: string; title_ar: string | null };
  classification: { title: string; title_ar: string | null } | null; consultation_types: string[];
  duration_options: { minutes: number; price: string; price_halalas: number }[];
  about?: { en: string | null; ar: string | null };
  services?: { id: number; title: string; title_ar: string | null }[];
  expertise?: { id: number; title: string; title_ar: string | null }[];
};
export const discovery = cache(async <T,>(path: string) => {
  const session = await readSession(), locale = await getLocale();
  return zuwaraV2<T>(path, { locale, token: session && Date.parse(session.session.access_expires_at) > Date.now() ? session.session.access_token : undefined });
});
export function doctorView(row: V2Doctor): ZuwaraDoctor {
  if (!Number.isSafeInteger(row.id) || row.id < 1 || !row.name || !Array.isArray(row.duration_options)) throw new Error("Invalid consultant.");
  return { id: row.id, doctorNumber: row.doctor_number, name: row.name, nameAr: row.name_ar, imageUrl: row.photo ?? row.image_url,
    designation: row.designation, designationAr: row.designation_ar, experienceYears: row.experience_years, rating: row.rating,
    reviewsCount: row.rating_count ?? row.reviews_count, acceptsInstant: row.accepts_instant?.public,
    happyClients: row.patients_served, startingPrice: row.starting_price, currency: row.currency,
    categoryId: row.category?.id ?? null, categoryTitle: row.category?.title ?? null, categoryTitleAr: row.category?.title_ar ?? null,
    classificationTitle: row.classification?.title ?? null, classificationTitleAr: row.classification?.title_ar ?? null,
    consultationTypes: row.consultation_types, enabledDurations: row.duration_options.map(d => ({ minutes: d.minutes, price: d.price })),
    durationOptions: row.duration_options.map(d => ({ minutes: d.minutes, price: d.price, enabled: true, status: "enabled" })) };
}
export const consultantCategories = cache(async (): Promise<ZuwaraCategory[]> => {
  const { data } = await discovery<{ id: number; title: string; title_ar: string | null; image_url?: string | null }[]>("/consultant-categories");
  if (!Array.isArray(data)) throw new Error("Invalid consultant categories.");
  return data.map(row => ({ id: row.id, title: row.title, titleAr: row.title_ar, imageUrl: row.image_url ?? null }));
});
export async function consultantDirectory(query = new URLSearchParams()) {
  const rows: V2Doctor[] = [], seen = new Set<number>();
  for (let page = 1; page <= 100; page++) {
    const params = new URLSearchParams(query); params.set("per_page", "50"); params.set("page", String(page));
    const payload = await discovery<V2Doctor[]>("/consultants?" + params), p = pagination(payload); let added = 0;
    for (const row of payload.data) { doctorView(row); if (!seen.has(row.id)) { seen.add(row.id); rows.push(row); added++; } }
    if (!p.has_more) return rows;
    if (!added) throw new Error("Invalid consultant pagination.");
  }
  throw new Error("Consultant directory limit exceeded.");
}
export type Calendar = { duration_enabled: boolean; dates: { date: string; status: string; is_available: boolean; slots: { start_time: string; end_time: string; period: string }[] }[] };
export function calendar(id: number, date: string, duration: number) {
  return discovery<Calendar>("/consultants/" + id + "/availability?" + new URLSearchParams({ start_date: date, duration_minutes: String(duration), days: "1" }));
}
