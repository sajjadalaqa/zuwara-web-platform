import { cache } from "react";
import { requireSession } from "@/lib/auth/session";
import type { Profile, ProfileInput, ServiceResult } from "./types";
// The OTP/refresh response is the documented identity source. No fabricated profile fields.
export const getProfile = cache(async (): Promise<Profile> => {
  const { user } = await requireSession();
  const { patientApi } = await import("@/lib/auth/session");
  const { data } = await patientApi<{ id: string; full_name: string; email: string | null; country_code: string; phone_number: string; profile_image: string | null; date_of_birth: string | null; city: string | null }>("/patients/me");
  if (data.id !== user.id || typeof data.full_name !== "string") throw new Error("Invalid patient profile.");
  return { id: data.id, fullName: data.full_name, email: data.email ?? "", emailVerified: undefined,
    phone: data.country_code + " " + data.phone_number, avatarUrl: data.profile_image || undefined,
    dateOfBirth: data.date_of_birth ?? "", gender: "", city: data.city ?? "", memberSince: "" };
});
// These write contracts are not exposed by the supplied Zuwara specification.
export async function updateProfile(input: ProfileInput): Promise<ServiceResult> {
  void input; await requireSession(); return { ok: false, code: "generic" };
}
export async function changePassword(current: string, next: string): Promise<ServiceResult> {
  void current; void next; await requireSession(); return { ok: false, code: "generic" };
}
export async function setAvatar(file: File | null): Promise<ServiceResult> {
  void file; await requireSession(); return { ok: false, code: "generic" };
}
export async function deleteAccount(password: string): Promise<ServiceResult> {
  void password; await requireSession(); return { ok: false, code: "generic" };
}
