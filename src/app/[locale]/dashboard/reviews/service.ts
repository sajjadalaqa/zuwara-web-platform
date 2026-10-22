import "server-only";
import { requireSession } from "@/lib/auth/session";
import { unavailableRead } from "@/lib/api/features";
import type {
  Paged,
  PendingReview,
  Review,
  ReviewCounts,
  ReviewInput,
  ServiceResult,
} from "./types";
export const PAGE_SIZE = 6;
export async function getReviewCounts(): Promise<ReviewCounts> {
  return unavailableRead("reviews");
}
export async function getPendingReviews(
  page: number,
  locale: string,
): Promise<Paged<PendingReview>> {
  void page;
  void locale;
  return unavailableRead("reviews");
}
export async function getMyReviews(
  page: number,
  locale: string,
): Promise<Paged<Review>> {
  void page;
  void locale;
  return unavailableRead("reviews");
}
export async function saveReview(input: ReviewInput): Promise<ServiceResult> {
  void input;
  await requireSession();
  return { ok: false, code: "generic" };
}
export async function deleteReview(id: string): Promise<ServiceResult> {
  void id;
  await requireSession();
  return { ok: false, code: "generic" };
}
