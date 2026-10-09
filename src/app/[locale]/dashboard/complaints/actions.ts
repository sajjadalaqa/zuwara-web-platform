"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addReply, createComplaint } from "./service";
import type { FormState } from "./types";
import { validateComplaint, validateReply } from "./validation";

// TODO (backend): check the session on the server in both actions.

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function createComplaintAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const input = {
    category: str(fd, "category"),
    subject: str(fd, "subject").trim(),
    description: str(fd, "description").trim(),
    relatedRef: str(fd, "relatedRef").trim(),
  };

  const errors = validateComplaint(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const res = await createComplaint(input);
  if (!res.ok) return { ok: false, errors: { _form: res.code } };

  revalidatePath("/", "layout");
  redirect(`${str(fd, "locale") === "ar" ? "/ar" : ""}/dashboard/complaints/${res.id}`);
}

export async function replyAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const id = str(fd, "complaintId");
  const message = str(fd, "message").trim();

  const code = validateReply(message);
  if (code) return { ok: false, errors: { message: code } };

  const res = await addReply(id, message);
  if (!res.ok) return { ok: false, errors: { _form: res.code } };

  revalidatePath("/", "layout");
  return { ok: true };
}