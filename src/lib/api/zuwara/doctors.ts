import "server-only";

import { getZuwaraHomeData } from "./home";
import type {
  ZuwaraCategory,
  ZuwaraDoctor,
  ZuwaraDoctorProfile,
  ZuwaraDoctorSearch,
  ZuwaraDurationOption,
  ZuwaraProfileItem,
  ZuwaraSlot,
} from "./types";

const API_BASE = (process.env.ZUWARA_API_BASE_URL ?? "https://dashboard.zuwara.sa/api").replace(/\/$/, "");
type UnknownRecord = Record<string, unknown>;

export type DoctorSearchOptions = {
  query?: string;
  categoryId?: number | null;
  durationMinutes?: number | null;
  date?: string | null;
  availableToday?: boolean;
  consultationType?: string | null;
  gender?: number | null;
  sortType?: number | null;
  start?: number;
  count?: number;
};

function record(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object" ? (value as UnknownRecord) : {};
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function boolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true";
}

function mediaUrl(path: unknown): string | null {
  const value = text(path);
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `https://dashboard.zuwara.sa/storage/${value.replace(/^\/+/, "")}`;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string") return [];
  try {
    const decoded = JSON.parse(value);
    return Array.isArray(decoded) ? decoded.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function durationOption(value: unknown): ZuwaraDurationOption | null {
  const row = record(value);
  const minutes = number(row.minutes ?? row.duration_minutes);
  if (!minutes) return null;
  return {
    minutes,
    price: text(row.price),
    enabled: boolean(row.enabled ?? row.is_enabled),
    status: text(row.status) ?? "closed",
  };
}

function slot(value: unknown): ZuwaraSlot | null {
  const row = record(value);
  const startTime = text(row.start_time);
  const endTime = text(row.end_time);
  if (!startTime || !endTime) return null;
  return {
    startTime,
    endTime,
    period: text(row.period) ?? "morning",
    available: boolean(row.is_available),
    booked: boolean(row.is_booked),
    reserved: boolean(row.is_reserved),
    status: text(row.status) ?? "closed",
  };
}

function profileItems(value: unknown): ZuwaraProfileItem[] {
  return Array.isArray(value)
    ? value.map((item) => {
        const row = record(item);
        const id = number(row.id);
        const title = text(row.title);
        return id && title ? { id, title, titleAr: text(row.title_ar) } : null;
      }).filter((item): item is ZuwaraProfileItem => item !== null)
    : [];
}

function normalizeDoctor(value: unknown): ZuwaraDoctor | null {
  const row = record(value);
  const id = number(row.id);
  const name = text(row.name);
  if (!id || !name) return null;
  const enabledDurations = Array.isArray(row.enabled_durations)
    ? row.enabled_durations.map(durationOption).filter((item): item is ZuwaraDurationOption => item !== null && item.enabled).map(({ minutes, price }) => ({ minutes, price: price ?? "0.00" }))
    : [];
  const options = Array.isArray(row.duration_options)
    ? row.duration_options.map(durationOption).filter((item): item is ZuwaraDurationOption => item !== null)
    : undefined;
  const slots = Array.isArray(row.slots)
    ? row.slots.map(slot).filter((item): item is ZuwaraSlot => item !== null)
    : undefined;
  const lowestPrice = enabledDurations.length
    ? Math.min(...enabledDurations.map((item) => Number(item.price)).filter(Number.isFinite))
    : number(row.starting_price || row.consultation_fee);

  return {
    id,
    doctorNumber: text(row.doctor_number) ?? String(id),
    name,
    nameAr: text(row.name_ar ?? row.full_name_ar),
    imageUrl: mediaUrl(row.image_url ?? row.image),
    designation: text(row.designation),
    designationAr: text(row.designation_ar),
    experienceYears: number(row.experience_years ?? row.experience_year),
    rating: number(row.rating),
    happyClients: number(row.happy_clients ?? row.total_patients_cured),
    startingPrice: Number.isFinite(lowestPrice) ? lowestPrice.toFixed(2) : "0.00",
    currency: text(row.currency) ?? "SR",
    categoryId: number(row.category_id) || null,
    categoryTitle: text(row.category_title),
    categoryTitleAr: text(row.category_title_ar),
    classificationTitle: text(row.classification_title),
    classificationTitleAr: text(row.classification_title_ar),
    consultationTypes: stringArray(row.consultation_types),
    enabledDurations,
    durationOptions: options,
    slots,
    scheduleStatus: text(row.schedule_status),
    scheduleMessage: text(row.schedule_message),
  };
}

async function post(endpoint: string, body: UnknownRecord): Promise<UnknownRecord | null> {
  const apiKey = process.env.ZUWARA_API_KEY;
  if (!apiKey) return null;
  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", apikey: apiKey },
      body: JSON.stringify(body),
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    return record(await response.json());
  } catch {
    return null;
  }
}

async function catalogue(categoryId?: number | null, start = 0, count = 50) {
  const payload = await post("user/fetchHomeConsultants", {
    start,
    count: Math.min(count, 50),
    ...(categoryId ? { category_id: categoryId } : {}),
  });
  const data = record(payload?.data);
  const doctors = Array.isArray(data.doctors)
    ? data.doctors.map(normalizeDoctor).filter((item): item is ZuwaraDoctor => item !== null)
    : [];
  const categories = Array.isArray(data.categories)
    ? data.categories.map((item) => {
        const row = record(item);
        const id = number(row.id);
        const title = text(row.title);
        return id && title ? { id, title, titleAr: text(row.title_ar), imageUrl: mediaUrl(row.image_url ?? row.image) } : null;
      }).filter((item): item is ZuwaraCategory => item !== null)
    : [];
  return { doctors, categories, available: payload !== null };
}

async function scheduleSearch(categoryId: number, options: DoctorSearchOptions): Promise<ZuwaraDoctor[]> {
  const payload = await post("user/searchDoctorV2", {
    start: options.start ?? 0,
    count: Math.min(options.count ?? 50, 50),
    category_id: categoryId,
    ...(options.durationMinutes ? { duration_minutes: options.durationMinutes } : {}),
    ...(options.date ? { date: options.date } : {}),
    ...(options.availableToday ? { available_today: true } : {}),
    ...(options.consultationType ? { consultation_type: options.consultationType } : {}),
    ...(options.gender !== null && options.gender !== undefined ? { gender: options.gender } : {}),
    ...(options.sortType ? { sort_type: options.sortType } : {}),
  });
  const data = record(payload?.data);
  return Array.isArray(data.doctors)
    ? data.doctors.map(normalizeDoctor).filter((item): item is ZuwaraDoctor => item !== null)
    : [];
}

export function riyadhToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

export async function searchZuwaraDoctors(options: DoctorSearchOptions = {}): Promise<ZuwaraDoctorSearch> {
  const base = await catalogue(null, 0, 50);
  if (!base.available) return { doctors: [], categories: [], date: options.date ?? null, durationMinutes: options.durationMinutes ?? null, available: false, mode: "catalog" };

  if (options.query?.trim()) {
    const payload = await post("user/searchDoctorByKeyword", { keyword: options.query.trim(), start: options.start ?? 0, count: Math.min(options.count ?? 50, 50) });
    const raw = payload ? payload.data : [];
    const rows = Array.isArray(raw) ? raw : raw ? [raw] : [];
    let doctors = rows.map(normalizeDoctor).filter((item): item is ZuwaraDoctor => item !== null);
    if (options.categoryId) doctors = doctors.filter((item) => item.categoryId === options.categoryId);
    return { doctors, categories: base.categories, date: null, durationMinutes: null, available: payload !== null, mode: "keyword" };
  }

  const scheduleRequested = Boolean(options.durationMinutes || options.date || options.availableToday || options.consultationType || options.gender !== null && options.gender !== undefined || options.sortType);
  if (scheduleRequested) {
    const categoryIds = options.categoryId ? [options.categoryId] : base.categories.map((item) => item.id);
    const groups = await Promise.all(categoryIds.map((id) => scheduleSearch(id, options)));
    const seen = new Set<number>();
    const doctors = groups.flat().filter((doctor) => !seen.has(doctor.id) && seen.add(doctor.id));
    return { doctors, categories: base.categories, date: options.date ?? riyadhToday(), durationMinutes: options.durationMinutes ?? null, available: true, mode: "schedule" };
  }

  const result = options.categoryId ? await catalogue(options.categoryId, options.start, options.count) : base;
  return { doctors: result.doctors, categories: base.categories, date: null, durationMinutes: null, available: result.available, mode: "catalog" };
}

export async function getZuwaraDoctorProfile(doctorId: number, date = riyadhToday(), durationMinutes?: number | null): Promise<ZuwaraDoctorProfile | null> {
  const [payload, home] = await Promise.all([
    post("user/fetchDoctorProfile", { doctor_id: doctorId, date, ...(durationMinutes ? { duration_minutes: durationMinutes } : {}) }),
    getZuwaraHomeData(),
  ]);
  if (!payload || payload.status === false) return null;
  const row = record(payload.data);
  const doctor = normalizeDoctor(row);
  if (!doctor) return null;
  const category = home.categories.find((item) => item.id === doctor.categoryId);
  const classification = record(row.classification);
  const slots = Array.isArray(row.slot_states) ? row.slot_states.map(slot).filter((item): item is ZuwaraSlot => item !== null) : [];
  const durationAvailability = Array.isArray(row.duration_availability)
    ? row.duration_availability.map((item) => {
        const value = record(item);
        const option = durationOption(value);
        if (!option) return null;
        return {
          ...option,
          slots: Array.isArray(value.slots) ? value.slots.map(slot).filter((slotItem): slotItem is ZuwaraSlot => slotItem !== null) : [],
          scheduleStatus: text(value.schedule_status),
          scheduleMessage: text(value.schedule_message),
        };
      }).filter((item): item is NonNullable<typeof item> => item !== null)
    : [];

  return {
    ...doctor,
    categoryTitle: doctor.categoryTitle ?? category?.title ?? null,
    categoryTitleAr: doctor.categoryTitleAr ?? category?.titleAr ?? null,
    classificationTitle: doctor.classificationTitle ?? text(classification.classification_title),
    classificationTitleAr: doctor.classificationTitleAr ?? text(classification.classification_title_ar),
    about: text(row.about_youself),
    aboutAr: text(row.about_yourself_ar),
    degrees: text(row.degrees),
    degreeAr: text(row.degree_ar),
    languagesSpoken: text(row.languages_spoken),
    educationalJourney: text(row.educational_journey),
    educationalJourneyAr: text(row.educational_journey_ar),
    selectedDate: text(row.selected_date) ?? date,
    selectedDurationMinutes: number(row.slots_duration_minutes) || null,
    scheduleAvailable: boolean(row.schedule_available),
    scheduleStatus: text(row.schedule_status),
    scheduleMessage: text(row.schedule_message),
    slots,
    services: profileItems(row.services),
    experience: profileItems(row.experience),
    expertise: profileItems(row.expertise),
    awards: profileItems(row.awards),
    durationAvailability,
  };
}
