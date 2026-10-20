import { cache } from "react";
import { requireSession } from "@/lib/auth/session";
import type { Profile, ProfileInput, ServiceResult } from "./types";
// The OTP/refresh response is the documented identity source. No fabricated profile fields.
export const getProfile = cache(async (): Promise<Profile> => {
  const { user } = await requireSession();
  return { id: user.id, fullName: user.full_name, email: user.email ?? "", emailVerified: undefined,
    phone: `${user.country_code} ${user.phone_number}`, avatarUrl: user.profile_image ?? undefined,
    dateOfBirth: "", gender: "", city: "", memberSince: "" };
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