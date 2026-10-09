"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createRecord, deleteRecord } from "./service";
import type { ActionResult, FormState } from "./types";
import { ALLOWED_TYPES, MAX_FILE_BYTES, matchesType, validateRecord } from "./validation";

// TODO (backend): check the session on the server in both actions.

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function createRecordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const input = {
    title: str(fd, "title").trim(),
    category: str(fd, "category"),
    recordDate: str(fd, "recordDate"),
    provider: str(fd, "provider").trim(),
    notes: str(fd, "notes").trim(),
  };

  const errors = validateRecord(input);

  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) errors.file = "file_required";
  else if (!ALLOWED_TYPES.includes(file.type)) errors.file = "file_bad_type";
  else if (file.size > MAX_FILE_BYTES) errors.file = "file_too_large";
  else if (!(await matchesType(file))) errors.file = "file_bad_type";

  if (Object.keys(errors).length || !(file instanceof File)) return { ok: false, errors };

  const res = await createRecord(input, file);
  if (!res.ok) return { ok: false, errors: { _form: res.code } };

  revalidatePath("/", "layout");
  redirect(`${str(fd, "locale") === "ar" ? "/ar" : ""}/dashboard/records`);
}

export async function deleteRecordAction(id: string): Promise<ActionResult> {
  const res = await deleteRecord(id);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}