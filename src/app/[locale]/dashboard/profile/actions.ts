"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changePassword, deleteAccount, setAvatar, updateProfile } from "./service";
import { initialFormState } from "./types";
import type { FormState, ServiceResult } from "./types";
import {
  ALLOWED_AVATAR_TYPES,
  MAX_AVATAR_BYTES,
  validatePassword,
  validateProfile,
} from "./validation";

// TODO (backend): every action below must check the session on the server first.

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

const failure = (
  r: Extract<ServiceResult, { ok: false }>,
  values?: Record<string, string>
): FormState => ({ ok: false, errors: { [r.field ?? "_form"]: r.code }, values });

export async function updateProfileAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const values = {
    fullName: str(fd, "fullName").trim(),
    phone: str(fd, "phone").trim(),
    dateOfBirth: str(fd, "dateOfBirth"),
    gender: str(fd, "gender"),
    city: str(fd, "city").trim(),
  };

  const errors = validateProfile(values);
  if (Object.keys(errors).length) return { ok: false, errors, values };

  const res = await updateProfile(values);
  if (!res.ok) return failure(res, values);

  revalidatePath("/", "layout"); // refreshes the header name too
  return { ok: true, values };
}

export async function changePasswordAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const current = str(fd, "current");
  const next = str(fd, "next");
  const confirm = str(fd, "confirm");

  const errors = validatePassword(current, next, confirm);
  if (Object.keys(errors).length) return { ok: false, errors };

  const res = await changePassword(current, next);
  if (!res.ok) return failure(res);
  return { ok: true };
}

export async function uploadAvatarAction(fd: FormData): Promise<FormState> {
  const file = fd.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errors: { avatar: "generic" } };
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return { ok: false, errors: { avatar: "bad_type" } };
  if (file.size > MAX_AVATAR_BYTES) return { ok: false, errors: { avatar: "too_large" } };

  const res = await setAvatar(file);
  if (!res.ok) return { ok: false, errors: { avatar: res.code } };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function removeAvatarAction(): Promise<FormState> {
  const res = await setAvatar(null);
  if (!res.ok) return { ok: false, errors: { avatar: res.code } };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteAccountAction(_prev: FormState, fd: FormData): Promise<FormState> {
  const password = str(fd, "password");
  const locale = str(fd, "locale");
  if (!password) return { ok: false, errors: { password: "required" } };

  const res = await deleteAccount(password);
  if (!res.ok) return failure(res);

  redirect(locale === "ar" ? "/ar" : "/");
  return initialFormState; // unreachable: redirect() throws
}