import "server-only";

import type { ZuwaraCategory, ZuwaraDoctor, ZuwaraHomeData } from "./types";

const API_BASE = (process.env.ZUWARA_API_BASE_URL ?? "https://dashboard.zuwara.sa/api").replace(/\/$/, "");

type UnknownRecord = Record<string, unknown>;

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

function category(value: unknown): ZuwaraCategory | null {
  const row = record(value);
  const id = number(row.id);
  const title = text(row.title);
  if (!id || !title) return null;

  return {
    id,
    title,
    titleAr: text(row.title_ar),
    imageUrl: text(row.image_url),
  };
}

function doctor(value: unknown): ZuwaraDoctor | null {
  const row = record(value);
  const id = number(row.id);
  const name = text(row.name);
  if (!id || !name) return null;

  const durations = Array.isArray(row.enabled_durations)
    ? row.enabled_durations.map((item) => {
        const duration = record(item);
        return { minutes: number(duration.minutes), price: text(duration.price) ?? "0.00" };
      }).filter((item) => item.minutes > 0)
    : [];

  return {
    id,
    doctorNumber: text(row.doctor_number) ?? String(id),
    name,
    nameAr: text(row.name_ar),
    imageUrl: text(row.image_url),
    designation: text(row.designation),
    designationAr: text(row.designation_ar),
    experienceYears: number(row.experience_years),
    rating: number(row.rating),
    happyClients: number(row.happy_clients),
    startingPrice: text(row.starting_price) ?? "0.00",
    currency: text(row.currency) ?? "SAR",
    categoryId: number(row.category_id) || null,
    categoryTitle: text(row.category_title),
    categoryTitleAr: text(row.category_title_ar),
    classificationTitle: text(row.classification_title),
    classificationTitleAr: text(row.classification_title_ar),
    consultationTypes: Array.isArray(row.consultation_types)
      ? row.consultation_types.filter((item): item is string => typeof item === "string")
      : [],
    enabledDurations: durations,
  };
}

export async function getZuwaraHomeData(): Promise<ZuwaraHomeData> {
  const apiKey = process.env.ZUWARA_API_KEY;
  if (!apiKey) return { categories: [], doctors: [], available: false };

  try {
    const response = await fetch(`${API_BASE}/user/fetchHomeConsultants`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        apikey: apiKey,
      },
      body: JSON.stringify({ start: 0, count: 6 }),
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return { categories: [], doctors: [], available: false };
    const payload = record(await response.json());
    const data = record(payload.data);
    const categories = Array.isArray(data.categories)
      ? data.categories.map(category).filter((item): item is ZuwaraCategory => item !== null)
      : [];
    const doctors = Array.isArray(data.doctors)
      ? data.doctors.map(doctor).filter((item): item is ZuwaraDoctor => item !== null)
      : [];

    return { categories, doctors, available: true };
  } catch {
    return { categories: [], doctors: [], available: false };
  }
}
