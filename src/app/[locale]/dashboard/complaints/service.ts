import { cache } from "react";
import { getStore, type StoredComplaint } from "./mock"; // TODO (backend): delete this import
import { COMPLAINT_STATUSES } from "./types";
import type {
  Complaint, ComplaintDetail, ComplaintFilters, ComplaintInput,
  ComplaintsResult, CreateResult, ServiceResult, StatusFilter,
} from "./types";

export const PAGE_SIZE = 6;

const supportReplies = (c: StoredComplaint) => c.messages.filter((m) => m.from === "support").length;

const toListItem = (c: StoredComplaint): Complaint => ({
  id: c.id,
  number: c.number,
  category: c.category,
  subject: c.subject,
  description: c.description,
  relatedRef: c.relatedRef,
  status: c.status,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
  repliesCount: supportReplies(c),
});

export async function getComplaints(
  filters: ComplaintFilters,
  locale: string
): Promise<ComplaintsResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ status: filters.status, page: String(filters.page), pageSize: String(PAGE_SIZE) });
  // const res = await fetch(`${process.env.API_URL}/me/complaints?${qs}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load complaints");
  // return (await res.json()) as ComplaintsResult;
  void locale;

  const all = [...getStore()].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  const counts = {
    all: all.length,
    ...Object.fromEntries(
      COMPLAINT_STATUSES.map((s) => [s, all.filter((c) => c.status === s).length])
    ),
  } as Record<StatusFilter, number>;

  const filtered = filters.status === "all" ? all : all.filter((c) => c.status === filters.status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, filters.page), pages);

  return {
    items: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(toListItem),
    total: filtered.length,
    page,
    pageSize: PAGE_SIZE,
    counts,
  };
}

export const getComplaint = cache(
  async (id: string, locale: string): Promise<ComplaintDetail | null> => {
    // TODO (backend): replace the body with
    // const res = await fetch(`${process.env.API_URL}/complaints/${id}`, {
    //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
    //   cache: "no-store",
    // });
    // if (res.status === 404) return null;            // shows the not-found screen
    // if (!res.ok) throw new Error("Failed to load complaint");
    // return (await res.json()) as ComplaintDetail;
    void locale;
    const c = getStore().find((x) => x.id === id);
    return c ? { ...structuredClone(c), repliesCount: supportReplies(c) } : null;
  }
);

export async function createComplaint(input: ComplaintInput): Promise<CreateResult> {
  // TODO (backend): POST `${API_URL}/complaints` with the fields (relatedRef may be empty).
  // Return { ok: true, id } from the API response. Map 429 -> { ok:false, code:"rate_limited" }.
  const store = getStore();
  const id = `cmp_${Date.now()}`;
  const now = new Date().toISOString();
  store.push({
    id,
    number: `CMP${30000 + store.length + 1}`,
    category: input.category as StoredComplaint["category"],
    subject: input.subject.trim(),
    description: input.description.trim(),
    relatedRef: input.relatedRef.trim() || undefined,
    status: "open",
    createdAt: now,
    updatedAt: now,
    messages: [],
    timeline: [{ key: "submitted", at: now }],
  });
  return { ok: true, id };
}

export async function addReply(id: string, message: string): Promise<ServiceResult> {
  // TODO (backend): POST `${API_URL}/complaints/${id}/messages` { message }
  // 404 -> { ok:false, code:"not_found" }, 409 -> { ok:false, code:"closed" }
  const c = getStore().find((x) => x.id === id);
  if (!c) return { ok: false, code: "not_found" };
  if (c.status === "resolved" || c.status === "closed") return { ok: false, code: "closed" };

  const now = new Date().toISOString();
  c.messages.push({ id: `m_${Date.now()}`, from: "you", body: message.trim(), createdAt: now });
  c.updatedAt = now;
  return { ok: true };
}