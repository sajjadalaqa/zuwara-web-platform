import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import type { ActionResult, SavedFilters, SavedResult } from "./types";

export const PAGE_SIZE = 6;

export async function getSavedProviders(
  filters: SavedFilters,
  locale: string
): Promise<SavedResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ q: filters.q, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  // const res = await fetch(`${process.env.API_URL}/me/saved-providers?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load saved providers");
  // return (await res.json()) as SavedResult;
  void locale;

  const q = filters.q.trim().toLowerCase();
  const all = getStore()
    .filter(
      (p) =>
        !q ||
        [p.name, p.specialty, p.city].some((v) => v.toLowerCase().includes(q))
    )
    .sort((a, b) => +new Date(b.savedAt) - +new Date(a.savedAt));

  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  return {
    items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: all.length,
    page,
    pageSize: PAGE_SIZE,
  };
}

// Total saved (ignores search). Used by the Overview card.
export const getSavedCount = cache(async (): Promise<number> => {
  // TODO (backend): GET `${API_URL}/me/saved-providers/count`
  return getStore().length;
});

export async function removeSaved(id: string): Promise<ActionResult> {
  // TODO (backend): DELETE `${API_URL}/me/saved-providers/${id}`
  const store = getStore();
  const i = store.findIndex((p) => p.id === id);
  if (i === -1) return { ok: false, error: "not_found" };
  store.splice(i, 1);
  return { ok: true };
}