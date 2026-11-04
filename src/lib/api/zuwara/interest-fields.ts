import "server-only";

export type InterestField = { id: number; title: string; title_ar: string | null; interest_code: string | null };

export async function interestFields(categoryId?: number, locale = "en"): Promise<InterestField[]> {
  if (categoryId !== undefined && (!Number.isSafeInteger(categoryId) || categoryId < 1)) throw new Error("Invalid interest category.");
  const base = (process.env.ZUWARA_API_BASE_URL ?? "https://dashboard.zuwara.sa/api").replace(/\/$/, "");
  const query = categoryId === undefined ? "" : "?" + new URLSearchParams({ category_id: String(categoryId) });
  // This public catalogue uses status:true, rather than the Platform V2 envelope.
  const response = await fetch(base + "/interest-fields" + query, {
    headers: { Accept: "application/json", "Accept-Language": locale === "ar" ? "ar" : "en" },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json();
  if (!response.ok || payload?.status !== true || !Array.isArray(payload.data)) throw new Error("Interest catalogue unavailable.");
  const seen = new Set<number>();
  return payload.data.map((row: Record<string, unknown>): InterestField => {
    if (!Number.isSafeInteger(row?.id) || Number(row.id) < 1 || typeof row.title !== "string" || !row.title.trim()) throw new Error("Invalid interest catalogue.");
    return { id: Number(row.id), title: row.title, title_ar: typeof row.title_ar === "string" ? row.title_ar : null, interest_code: typeof row.interest_code === "string" ? row.interest_code : null };
  }).filter((row: InterestField) => { if (seen.has(row.id)) return false; seen.add(row.id); return true; });
}
