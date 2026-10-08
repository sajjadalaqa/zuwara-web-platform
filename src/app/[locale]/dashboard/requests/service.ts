import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import { REQUEST_STATUSES } from "./types";
import type {
  ActionResult, Category, CreateResult, RequestFilters,
  RequestInput, RequestsResult, ServiceRequest, StatusFilter,
} from "./types";

export const PAGE_SIZE = 6;

const countsOf = (all: ServiceRequest[]) =>
  ({
    all: all.length,
    ...Object.fromEntries(
      REQUEST_STATUSES.map((s) => [s, all.filter((r) => r.status === s).length])
    ),
  }) as Record<StatusFilter, number>;

export async function getRequests(
  filters: RequestFilters,
  locale: string
): Promise<RequestsResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ status: filters.status, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  // const res = await fetch(`${process.env.API_URL}/me/service-requests?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load service requests");
  // return (await res.json()) as RequestsResult;
  void locale;

  const all = [...getStore()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const filtered = filters.status === "all" ? all : all.filter((r) => r.status === filters.status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    counts: countsOf(all),
  };
}

// Used by the Overview card. cache() = one fetch per request.
export const getRequestCounts = cache(async (): Promise<Record<StatusFilter, number>> => {
  // TODO (backend): GET `${API_URL}/me/service-requests/counts`
  return countsOf(getStore());
});

export async function createRequest(input: RequestInput): Promise<CreateResult> {
  // TODO (backend): POST `${API_URL}/service-requests` with the fields (budget as a number or null).
  // Return { ok: true, id } from the API response, or map API errors to codes.
  const store = getStore();
  const id = `req_${Date.now()}`;
  store.push({
    id,
    number: `REQ${20000 + store.length + 1}`,
    category: input.category as Category,
    title: input.title.trim(),
    description: input.description.trim(),
    city: input.city.trim(),
    preferredDate: input.preferredDate,
    budget: input.budget ? Number(input.budget) : undefined,
    currency: "SAR",
    status: "open",
    offersCount: 0,
    createdAt: new Date().toISOString(),
  });
  return { ok: true, id };
}

export async function cancelRequest(id: string): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/service-requests/${id}/cancel`
  // 404 -> { ok:false, error:"not_found" }, 409 -> { ok:false, error:"not_cancellable" }
  const r = getStore().find((x) => x.id === id);
  if (!r) return { ok: false, error: "not_found" };
  if (r.status !== "open") return { ok: false, error: "not_cancellable" };
  r.status = "cancelled";
  return { ok: true };
}