import "server-only";
import { cache } from "react";
import { getZuwaraV2, ZuwaraV2Error } from "./v2";

export type Consultant = {
  id: number;
  name: string;
  name_ar: string | null;
  designation: string | null;
  designation_ar: string | null;
  image_url: string | null;
  rating: number;
  reviews_count: number;
  about?: { en: string | null; ar: string | null };
};

export function providerViewModel(consultant: Consultant) {
  return {
    id: consultant.id,
    name: consultant.name,
    nameAr: consultant.name_ar ?? undefined,
    title: consultant.designation ?? undefined,
    titleAr: consultant.designation_ar ?? undefined,
    image: consultant.image_url ?? undefined,
    rating: consultant.rating,
    reviewsCount: consultant.reviews_count,
    bio: consultant.about?.en ?? undefined,
    bioAr: consultant.about?.ar ?? undefined,
  };
}

export async function getV2Providers(locale: string) {
  const providers: ReturnType<typeof providerViewModel>[] = [];
  const seen = new Set<number>();
  let page = 1;
  // Load all pages so the existing client-side search and pagination remain accurate.
  for (;;) {
    const payload = await getZuwaraV2<Consultant[]>(`/consultants?per_page=50&page=${page}`, locale);
    if (!Array.isArray(payload.data)) throw new ZuwaraV2Error(502);
    let added = 0;
    for (const consultant of payload.data) {
      if (!seen.has(consultant.id)) {
        seen.add(consultant.id);
        providers.push(providerViewModel(consultant));
        added++;
      }
    }
    if (!payload.meta?.pagination?.has_more) return providers;
    if (!added || page >= 100) throw new ZuwaraV2Error(502);
    page++;
  }
}

export const getV2Provider = cache(async (id: string, locale: string) => {
  if (!/^[1-9]\d*$/.test(id)) return null;
  try {
    const payload = await getZuwaraV2<Consultant>(`/consultants/${id}`, locale);
    if (!payload.data?.id || !payload.data.name) throw new ZuwaraV2Error(502);
    return providerViewModel(payload.data);
  } catch (error) {
    if (error instanceof ZuwaraV2Error && error.status === 404) return null;
    throw error;
  }
});