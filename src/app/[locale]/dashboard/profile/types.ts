export type Gender = "male" | "female" | "";

export type Profile = {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  dateOfBirth: string; // "YYYY-MM-DD" or ""
  gender: Gender;
  city: string;
  avatarUrl?: string;
  memberSince: string; // ISO 8601
};

export type ProfileInput = {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  city: string;
};

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode =
  | "required"
  | "invalid_name"
  | "invalid_value"
  | "invalid_phone"
  | "invalid_date"
  | "weak"
  | "mismatch"
  | "wrong_password"
  | "same_password"
  | "too_large"
  | "bad_type"
  | "generic";

export type FormState = {
  ok: boolean;
  errors?: Record<string, ErrorCode>; // key = field name, "_form" = whole form
  values?: Record<string, string>; // echoed back so fields keep what the user typed
};

export const initialFormState: FormState = { ok: false };

export type ServiceResult =
  | { ok: true }
  | { ok: false; code: ErrorCode; field?: string };