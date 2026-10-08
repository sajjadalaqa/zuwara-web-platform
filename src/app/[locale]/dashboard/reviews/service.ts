import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import type {
  Paged, PendingReview, Review, ReviewCounts, ReviewInput, ServiceResult,
} from "./types";

export const PAGE_SIZE = 6;

function paginate<T>(all: T[], requested: number): Paged<T> {
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, requested), pages);
  return {
    items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: all.length,
    page,
    pageSize: PAGE_SIZE,
  };
}

const pendingList = () => {
  const { completed, reviews } = getStore();
  const reviewed = new Set(reviews.map((r) => r.appointmentId));
  return completed
    .filter((c) => !reviewed.has(c.appointmentId))
    .sort((a, b) => +new Date(b.completedAt) - +new Date(a.completedAt));
};

export const getReviewCounts = cache(async (): Promise<ReviewCounts> => {
  // TODO (backend): GET `${API_URL}/me/reviews/counts`  -> { pending, reviewed }
  return { pending: pendingList().length, reviewed: getStore().reviews.length };
});

export async function getPendingReviews(
  page: number,
  locale: string
): Promise<Paged<PendingReview>> {
  // TODO (backend): replace with
  // const res = await fetch(`${process.env.API_URL}/me/reviews/pending?page=${page}&pageSize=${PAGE_SIZE}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load reviews");
  // return (await res.json()) as Paged<PendingReview>;
  void locale;
  return paginate(pendingList(), page);
}

export async function getMyReviews(page: number, locale: string): Promise<Paged<Review>> {
  // TODO (backend): GET `${API_URL}/me/reviews?page=${page}&pageSize=${PAGE_SIZE}` (same pattern as above)
  void locale;
  const all = [...getStore().reviews].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );
  return paginate(all, page);
}

export async function saveReview(input: ReviewInput): Promise<ServiceResult> {
  // TODO (backend): POST `${API_URL}/reviews` (create) or PATCH `${API_URL}/reviews/${reviewId}` (edit).
  // Map API errors to codes: 404 -> "not_found", 409 -> "already_reviewed".
  const store = getStore();

  if (input.reviewId) {
    const r = store.reviews.find((x) => x.id === input.reviewId);
    if (!r) return { ok: false, code: "not_found" };
    r.rating = input.rating;
    r.comment = input.comment;
    r.updatedAt = new Date().toISOString();
    return { ok: true };
  }

  const appt = store.completed.find((c) => c.appointmentId === input.appointmentId);
  if (!appt) return { ok: false, code: "not_found" };
  if (store.reviews.some((r) => r.appointmentId === input.appointmentId)) {
    return { ok: false, code: "already_reviewed" };
  }
  store.reviews.push({
    id: `rev_${Date.now()}`,
    appointmentId: appt.appointmentId,
    number: appt.number,
    provider: appt.provider,
    rating: input.rating,
    comment: input.comment,
    createdAt: new Date().toISOString(),
  });
  return { ok: true };
}

export async function deleteReview(id: string): Promise<ServiceResult> {
  // TODO (backend): DELETE `${API_URL}/reviews/${id}`
  const store = getStore();
  const i = store.reviews.findIndex((r) => r.id === id);
  if (i === -1) return { ok: false, code: "not_found" };
  store.reviews.splice(i, 1);
  return { ok: true };
}