import type { ErrorCode } from "./types";

export const MAX_COMMENT = 500;

// If you change the limit, update "comment_too_long" in copy.ts too.
export function validateReview(rating: number, comment: string) {
  const e: Partial<Record<"rating" | "comment", ErrorCode>> = {};
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) e.rating = "rating_required";
  if (comment.length > MAX_COMMENT) e.comment = "comment_too_long";
  return e;
}