"use server";

import { revalidatePath } from "next/cache";
import { deleteReview, saveReview } from "./service";
import type { ActionResult, FormState } from "./types";
import { validateReview } from "./validation";

// TODO (backend): check the session on the server in both actions, and make sure
// the appointment belongs to the signed-in user and is completed.

export async function saveReviewAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const appointmentId = String(fd.get("appointmentId") ?? "");
  const reviewId = String(fd.get("reviewId") ?? "") || undefined;
  const rating = Number(String(fd.get("rating") ?? "0"));
  const comment = String(fd.get("comment") ?? "").trim();
  const values = { rating: rating ? String(rating) : "", comment };

  const errors = validateReview(rating, comment);
  if (Object.keys(errors).length) return { ok: false, errors, values };
  if (!appointmentId) return { ok: false, errors: { _form: "not_found" }, values };

  const res = await saveReview({ appointmentId, reviewId, rating, comment });
  if (!res.ok) return { ok: false, errors: { _form: res.code }, values };

  revalidatePath("/", "layout");
  return { ok: true, values };
}

export async function deleteReviewAction(id: string): Promise<ActionResult> {
  const res = await deleteReview(id);
  if (!res.ok) return { ok: false, error: res.code };
  revalidatePath("/", "layout");
  return { ok: true };
}