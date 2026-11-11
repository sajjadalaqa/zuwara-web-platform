import "server-only";
import { cache } from "react";
import { d4hV2 } from "./v2";
import { slugify } from "@/lib/api/zuwara/slugs";
import type { D4hCategoryData } from "./types";
type CatalogRow = { id: number; name: string; name_ar?: string; description?: string; description_ar?: string; image_url?: string; services_count?: number; screen_type?: number };
export type CatalogService = CatalogRow & { price?: { final: string; currency: string }; provider?: { id: number; name: string } | null };
async function collection<T>(path: string, locale: string): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; page <= 100; page++) {
    const payload = await d4hV2<T[]>(path + (path.includes("?") ? "&" : "?") + "per_page=50&page=" + page, { locale });
    if (!Array.isArray(payload.data)) throw new Error("Invalid catalog response.");
    rows.push(...payload.data);
    if (!payload.meta?.pagination?.has_more) return rows;
    if (!payload.data.length) throw new Error("Invalid catalog pagination.");
  }
  throw new Error("Catalog pagination limit exceeded.");
}
export const getD4hCategories = cache(async (locale = "en"): Promise<D4hCategoryData> => {
  const rows = await collection<CatalogRow>("/catalog/categories", locale);
  return { available: true, categories: rows.map(row => ({
    id: row.id, name: locale === "ar" ? row.name_ar || row.name : row.name, nameAr: row.name_ar,
    description: (locale === "ar" ? row.description_ar || row.description : row.description) ?? null,
    imageUrl: row.image_url ?? null, serviceCount: row.services_count ?? 0,
    slug: slugify(row.name), screenType: row.screen_type ?? 0,
    href: row.screen_type === 1 ? "/healthcare/specialties" : row.screen_type === 2 ? "/dashboard/instant?type=public" : row.screen_type === 3 ? "/dashboard/therapy" : "/home-services?category_id=" + row.id,
  })) };
});
export function getD4hSubcategories(categoryId: number, locale: string) {
  return collection<CatalogRow>("/catalog/subcategories?category_id=" + categoryId, locale);
}
export function getD4hServices(categoryId: number, locale: string, subcategoryId?: number) {
  return collection<CatalogService>("/catalog/services?category_id=" + categoryId + (subcategoryId ? "&subcategory_id=" + subcategoryId : ""), locale);
}
