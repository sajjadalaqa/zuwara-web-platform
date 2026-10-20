import "server-only";
import { cache } from "react";
import { d4hV2, D4hV2Error } from "./v2";

export type D4hProvider = { id: number; name: string };
function provider(value: unknown): D4hProvider {
  if (!value || typeof value !== "object") throw new D4hV2Error(502, "INVALID_RESPONSE");
  const row = value as Record<string, unknown>;
  if (!Number.isSafeInteger(row.id) || Number(row.id) < 1 || typeof row.name !== "string" || !row.name.trim()) throw new D4hV2Error(502, "INVALID_RESPONSE");
  // Public V2 intentionally exposes no contact, verification, rating, role or photo fields.
  return { id: Number(row.id), name: row.name };
}
export async function getD4hProviders(locale: string): Promise<D4hProvider[]> {
  const providers: D4hProvider[] = [];
  const seen = new Set<number>();
  for (let page = 1; page <= 100; page++) {
    const payload = await d4hV2<unknown[]>(`/providers?per_page=50&page=${page}`, { locale });
    if (!Array.isArray(payload.data) || !payload.meta?.pagination) throw new D4hV2Error(502, "INVALID_RESPONSE");
    let added = 0;
    for (const item of payload.data) {
      const row = provider(item);
      if (!seen.has(row.id)) { seen.add(row.id); providers.push(row); added++; }
    }
    if (!payload.meta.pagination.has_more) return providers;
    if (!added) throw new D4hV2Error(502, "INVALID_PAGINATION");
  }
  throw new D4hV2Error(502, "INVALID_PAGINATION");
}
export const getD4hProvider = cache(async (id: string, locale: string): Promise<D4hProvider | null> => {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) return null;
  try {
    const payload = await d4hV2<unknown>(`/providers/${id}`, { locale });
    const result = provider(payload.data);
    if (result.id !== Number(id)) throw new D4hV2Error(502, "INVALID_RESPONSE");
    return result;
  } catch (error) {
    if (error instanceof D4hV2Error && error.status === 404) return null;
    throw error;
  }
});