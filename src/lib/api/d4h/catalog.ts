import "server-only";

import type { D4hCategory, D4hCategoryData } from "./types";

const API_BASE = (process.env.D4H_API_BASE_URL ?? "https://dashboardvisit.zuwara.sa/api").replace(/\/$/, "");

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

function category(value: unknown): D4hCategory | null {
  const row = record(value);
  const id = number(row.id);
  const name = text(row.name);
  if (!id || !name || number(row.status) !== 1) return null;

  return {
    id,
    name,
    description: text(row.description),
    imageUrl: text(row.category_image),
    serviceCount: number(row.services),
  };
}

export async function getD4hCategories(): Promise<D4hCategoryData> {
  try {
    const response = await fetch(`${API_BASE}/category-list?per_page=50&is_featured=1`, {
      headers: { Accept: "application/json", "language-code": "en" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return { categories: [], available: false };
    const payload = record(await response.json());
    const categories = Array.isArray(payload.data)
      ? payload.data.map(category).filter((item): item is D4hCategory => item !== null && item.serviceCount > 0)
      : [];

    return { categories, available: true };
  } catch {
    return { categories: [], available: false };
  }
}
