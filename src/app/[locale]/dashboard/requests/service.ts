import { cache } from "react";
import { getOffers, getStore } from "./mock"; // TODO (backend): delete this import
import { REQUEST_STATUSES } from "./types";
import type {
  ActionResult, Category, CreateResult, RequestDetail, RequestFilters,
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

// ---------- Single request ----------

export const getRequest = cache(
  async (id: string, locale: string): Promise<RequestDetail | null> => {
    // TODO (backend): replace the body with
    // const res = await fetch(`${process.env.API_URL}/service-requests/${id}`, {
    //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
    //   cache: "no-store",
    // });
    // if (res.status === 404) return null;            // shows the not-found screen
    // if (!res.ok) throw new Error("Failed to load request");
    // return (await res.json()) as RequestDetail;
    void locale;
    const r = getStore().find((x) => x.id === id);
    return r ? toDetail(r) : null;
  }
);

// TODO (backend): delete this helper. It only fakes the extra fields for the mock.
function toDetail(r: ServiceRequest): RequestDetail {
  const DAY = 24 * 3600 * 1000;
  const created = +new Date(r.createdAt);
  const iso = (ms: number) => new Date(ms).toISOString();

  const offers = getOffers(r).map((o) => ({
    ...o,
    status: r.status === "cancelled" && o.status === "pending" ? ("declined" as const) : o.status,
  }));
  const accepted = offers.find((o) => o.status === "accepted");

  const timeline: RequestDetail["timeline"] = [{ key: "posted", at: r.createdAt }];
  if (r.status === "in_progress" || r.status === "completed") {
    timeline.push({ key: "accepted", at: iso(Math.min(Date.now(), created + DAY)) });
  }
  if (r.status === "completed") {
    timeline.push({
      key: "completed",
      at: iso(Math.min(Date.now(), +new Date(`${r.preferredDate}T12:00:00Z`))),
    });
  }
  if (r.status === "cancelled") {
    timeline.push({ key: "cancelled", at: iso(Math.min(Date.now(), created + DAY)) });
  }

  return { ...r, offers, agreedPrice: accepted?.price, timeline };
}

export async function acceptOffer(requestId: string, offerId: string): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/service-requests/${requestId}/offers/${offerId}/accept`
  // 404 -> { ok:false, error:"not_found" }, 409 -> { ok:false, error:"offer_unavailable" }
  const r = getStore().find((x) => x.id === requestId);
  if (!r) return { ok: false, error: "not_found" };
  if (r.status !== "open") return { ok: false, error: "offer_unavailable" };

  const offers = getOffers(r);
  const chosen = offers.find((o) => o.id === offerId);
  if (!chosen) return { ok: false, error: "not_found" };
  if (chosen.status !== "pending") return { ok: false, error: "offer_unavailable" };

  offers.forEach((o) => { o.status = o.id === chosen.id ? "accepted" : "declined"; });
  r.status = "in_progress";
  r.provider = { id: chosen.provider.id, name: chosen.provider.name };
  return { ok: true };
}