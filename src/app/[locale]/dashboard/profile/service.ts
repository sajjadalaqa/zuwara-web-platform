import { cache } from "react";
import { getStore } from "./mock"; // TODO (backend): delete this import
import type { Gender, Profile, ProfileInput, ServiceResult } from "./types";

// cache() = one fetch per request, even though layout and page both call it.
export const getProfile = cache(async (): Promise<Profile> => {
  // TODO (backend):
  // const res = await fetch(`${process.env.API_URL}/me`, {
  //   headers: { Authorization: `Bearer ${await getToken()}` }, cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load profile");
  // return (await res.json()) as Profile;
  return { ...getStore().profile };
});

export async function updateProfile(input: ProfileInput): Promise<ServiceResult> {
  // TODO (backend): PATCH `${API_URL}/me` with the fields; map API errors to
  // { ok:false, code:"...", field:"..." } (e.g. phone already used -> code "invalid_phone").
  const store = getStore();
  store.profile = {
    ...store.profile,
    fullName: input.fullName.trim(),
    phone: input.phone.trim(),
    dateOfBirth: input.dateOfBirth,
    gender: input.gender as Gender,
    city: input.city.trim(),
  };
  return { ok: true };
}

export async function changePassword(current: string, next: string): Promise<ServiceResult> {
  // TODO (backend): POST `${API_URL}/me/password` { current, next }
  // 401/403 -> { ok:false, code:"wrong_password", field:"current" }
  const store = getStore();
  if (current !== store.password) {
    return { ok: false, code: "wrong_password", field: "current" };
  }
  store.password = next;
  return { ok: true };
}

export async function setAvatar(file: File | null): Promise<ServiceResult> {
  // TODO (backend): upload to your storage (or POST multipart to `${API_URL}/me/avatar`),
  // then save the returned URL. Passing null removes the photo.
  const store = getStore();
  if (!file) {
    store.profile = { ...store.profile, avatarUrl: undefined };
    return { ok: true };
  }
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  store.profile = { ...store.profile, avatarUrl: `data:${file.type};base64,${base64}` };
  return { ok: true };
}

export async function deleteAccount(password: string): Promise<ServiceResult> {
  // TODO (backend): DELETE `${API_URL}/me` with the password, then destroy the session.
  // The mock only checks the password; it doesn't actually delete anything.
  if (password !== getStore().password) {
    return { ok: false, code: "wrong_password", field: "password" };
  }
  return { ok: true };
}