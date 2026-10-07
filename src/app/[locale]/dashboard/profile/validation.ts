import type { ErrorCode, ProfileInput } from "./types";

export const MAX_AVATAR_BYTES = 900 * 1024;
export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Errors = Record<string, ErrorCode>;

export function validateProfile(i: ProfileInput): Errors {
  const e: Errors = {};

  const name = i.fullName.trim();
  if (!name) e.fullName = "required";
  else if (name.length < 2 || name.length > 80) e.fullName = "invalid_name";

  const phone = i.phone.trim();
  if (!phone) e.phone = "required";
  else if (!/^\+?[0-9\s-]{8,16}$/.test(phone)) e.phone = "invalid_phone";

  if (i.dateOfBirth) {
    const d = new Date(`${i.dateOfBirth}T00:00:00Z`);
    const now = new Date();
    const oldest = new Date(Date.UTC(now.getUTCFullYear() - 120, 0, 1));
    const okFormat = /^\d{4}-\d{2}-\d{2}$/.test(i.dateOfBirth);
    if (!okFormat || Number.isNaN(+d) || d > now || d < oldest) e.dateOfBirth = "invalid_date";
  }

  if (!["", "male", "female"].includes(i.gender)) e.gender = "invalid_value";
  if (i.city.trim().length > 60) e.city = "invalid_value";

  return e;
}

export function validatePassword(current: string, next: string, confirm: string): Errors {
  const e: Errors = {};
  if (!current) e.current = "required";

  if (!next) e.next = "required";
  else if (next.length < 8 || !/[A-Za-z]/.test(next) || !/\d/.test(next)) e.next = "weak";
  else if (next === current) e.next = "same_password";

  if (!confirm) e.confirm = "required";
  else if (confirm !== next) e.confirm = "mismatch";

  return e;
}