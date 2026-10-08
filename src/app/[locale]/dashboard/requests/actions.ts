"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { acceptOffer, cancelRequest, createRequest } from "./service";
import type { ActionResult, FormState } from "./types";
import { validateRequest } from "./validation";

// TODO (backend): check the session on the server in both actions.

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function createRequestAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const input = {
    category: str(fd, "category"),
    title: str(fd, "title").trim(),
    description: str(fd, "description").trim(),
    city: str(fd, "city").trim(),
    preferredDate: str(fd, "preferredDate"),
    budget: str(fd, "budget").trim(),
  };

  const errors = validateRequest(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const res = await createRequest(input);
  if (!res.ok) return { ok: false, errors: { _form: res.code } };

  revalidatePath("/", "layout"); // refreshes the Overview count
  redirect(`${str(fd, "locale") === "ar" ? "/ar" : ""}/dashboard/requests`);
}

export async function cancelRequestAction(id: string): Promise<ActionResult> {
  const res = await cancelRequest(id);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

export async function acceptOfferAction(
  requestId: string,
  offerId: string
): Promise<ActionResult> {
  // TODO (backend): check the session, and that this request belongs to the signed-in user.
  const res = await acceptOffer(requestId, offerId);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}