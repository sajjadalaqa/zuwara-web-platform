"use server";
import { getLocale } from "next-intl/server";
import { zuwaraV2, ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import { clearPending, clearSession, readPending, readSession, savePending, saveSession, type OtpInput, type SessionData } from "./session";

type Result = { ok: true; resendAt?: number; expiresAt?: number } | { ok: false; error: string; requestId?: string };
function failure(error: unknown): Result {
  if (error instanceof ZuwaraV2Error) {
    const messages: Record<string, string> = {
      ACCOUNT_NOT_FOUND: "No account was found for this phone number. Please sign up.",
      ACCOUNT_ALREADY_EXISTS: "This phone number already has an account. Please sign in.",
      EMAIL_ALREADY_EXISTS: "This email address is already registered.",
      INVALID_PHONE_NUMBER: "Enter a valid phone number.",
      OTP_INVALID: "The verification code is incorrect.", OTP_EXPIRED: "The code expired. Request a new code.",
      OTP_CHALLENGE_USED: "This code has already been used. Request a new code.",
      OTP_ATTEMPTS_EXCEEDED: "Too many attempts. Request a new code.",
      OTP_RATE_LIMITED: "Please wait before requesting another code.",
      OTP_DELIVERY_FAILED: "The code could not be delivered. Please try again later.",
      ACCOUNT_BLOCKED: "Your account is blocked. Please contact support.",
      ACCOUNT_INACTIVE: "Your account is inactive. Please contact support.",
      API_V2_DISABLED: "Sign-in is temporarily unavailable. Please try again later.",
    };
    return { ok: false, error: messages[error.code] ?? "The request could not be completed. Please try again.", requestId: error.requestId };
  }
  return { ok: false, error: "Unable to connect. Please try again later." };
}
async function issue(input: OtpInput, locale: string): Promise<Result> {
  const pending = await readPending();
  if (pending && pending.resendAt > Date.now()) return { ok: false, error: "Please wait before requesting another code." };
  const response = await zuwaraV2<{ challenge_id: string; expires_in: number; resend_after: number }>("/auth/otp/request", { method: "POST", body: input, locale });
  const { challenge_id, expires_in, resend_after } = response.data;
  if (!challenge_id || !Number.isFinite(expires_in) || !Number.isFinite(resend_after)) throw new Error("Invalid OTP response.");
  const expiresAt = Date.now() + Math.min(300, expires_in) * 1000;
  const resendAt = Date.now() + Math.max(1, resend_after) * 1000;
  await savePending({ input, locale, challenge_id, expiresAt, resendAt, pendingUntil: Date.now() + 10 * 60_000 });
  return { ok: true, expiresAt, resendAt };
}
export async function requestOtpAction(input: OtpInput): Promise<Result> {
  try {
    if (!input || !["login", "register"].includes(input.intent) ||
        !/^\+\d{1,4}$/.test(input.country_code) || !/^\d{6,15}$/.test(input.phone_number)) return { ok: false, error: "Enter a valid phone number and country code." };
    if (input.intent === "register" && (!input.full_name?.trim() || input.full_name.length > 150 ||
        (input.email && (!/^\S+@\S+\.\S+$/.test(input.email) || input.email.length > 254)) || (input.referral_code?.length ?? 0) > 100)) return { ok: false, error: "Check your name, email and referral code." };
    const body: OtpInput = { intent: input.intent, country_code: input.country_code, phone_number: input.phone_number };
    if (input.intent === "register") Object.assign(body, { full_name: input.full_name?.trim(), email: input.email?.trim() || undefined, referral_code: input.referral_code?.trim() || undefined });
    return await issue(body, await getLocale());
  } catch (error) { return failure(error); }
}
export async function otpStatusAction(): Promise<Result> {
  const pending = await readPending();
  return pending ? { ok: true, resendAt: pending.resendAt, expiresAt: pending.expiresAt } : { ok: false, error: "Request a verification code from the sign-in page first." };
}
export async function resendOtpAction(): Promise<Result> {
  try {
    const pending = await readPending();
    if (!pending) return { ok: false, error: "Start again from the sign-in page." };
    return await issue(pending.input, pending.locale);
  } catch (error) { return failure(error); }
}
export async function verifyOtpAction(otp: string): Promise<Result> {
  try {
    const pending = await readPending();
    if (!pending || pending.expiresAt <= Date.now()) return { ok: false, error: "The code expired. Request a new code." };
    if (!/^\d{6}$/.test(otp)) return { ok: false, error: "Enter the 6-digit code." };
    const response = await zuwaraV2<SessionData>("/auth/otp/verify", { method: "POST", body: { challenge_id: pending.challenge_id, otp }, locale: pending.locale });
    await saveSession(response.data);
    await clearPending();
    return { ok: true };
  } catch (error) { return failure(error); }
}
export async function refreshSessionAction(): Promise<Result> {
  try {
    const current = await readSession();
    if (!current) return { ok: false, error: "Please sign in again." };
    if (Date.parse(current.session.access_expires_at) > Date.now() + 60_000) return { ok: true };
    const response = await zuwaraV2<SessionData>("/auth/refresh", { method: "POST", token: current.session.refresh_token });
    await saveSession(response.data);
    return { ok: true };
  } catch (error) {
    if (error instanceof ZuwaraV2Error && [401, 403].includes(error.status)) await clearSession();
    return failure(error);
  }
}
export async function logoutAction(): Promise<Result> {
  try {
    const current = await readSession();
    if (current) await zuwaraV2("/auth/session", { method: "DELETE", token: current.session.access_token });
  } catch (error) {
    if (!(error instanceof ZuwaraV2Error && error.status === 401)) return failure(error);
  }
  await clearSession();
  await clearPending();
  return { ok: true };
}