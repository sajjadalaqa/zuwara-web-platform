import "server-only";
import { cookies } from "next/headers";
import { getLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { seal, unseal } from "./seal";
import { zuwaraV2, ZuwaraV2Error } from "@/lib/api/zuwara/v2";

export type PatientUser = {
  id: string; zuwara_user_id: number; full_name: string; email: string | null;
  country_code: string; phone_number: string; profile_image: string | null; locale: string;
};
export type PatientSession = {
  access_token: string; access_expires_at: string;
  refresh_token: string; refresh_expires_at: string;
};
export type D4hSession = { user_id: number; access_token: string; expires_at: string };
export type SessionData = {
  user: PatientUser; session: PatientSession;
  connections?: { d4h?: { available: boolean; session?: D4hSession; error_code?: string } };
};
export type OtpInput = {
  intent: "login" | "register"; country_code: string; phone_number: string;
  full_name?: string; email?: string; referral_code?: string;
};
export type PendingOtp = {
  input: OtpInput; locale: string; challenge_id: string;
  expiresAt: number; resendAt: number; pendingUntil: number;
};
const SESSION = "zuwara_session";
const PENDING = "zuwara_otp";
const D4H_SESSION = "zuwara_d4h_session";
function secret() {
  const value = process.env.NEXT_SERVER_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("Configure NEXT_SERVER_SESSION_SECRET on the server.");
  return value;
}
export async function readCookie<T>(name: string): Promise<T | null> {
  const value = (await cookies()).get(name)?.value;
  return value ? unseal<T>(value, secret(), name) : null;
}
async function writeCookie(name: string, value: unknown, expires: Date) {
  const encrypted = seal(value, secret(), name);
  if (encrypted.length > 3800) throw new Error("Session exceeds cookie size limit.");
  (await cookies()).set(name, encrypted, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}
export async function readSession() {
  const data = await readCookie<SessionData>(SESSION);
  if (!data?.session?.access_token || !data.session.refresh_token || !data.user?.id) return null;
  if (!(Date.parse(data.session.refresh_expires_at) > Date.now())) return null;
  return data;
}
export async function readHeaderSession() {
  const session = await readSession();
  const sessionExpiresAt = session ? Date.parse(session.session.access_expires_at) : 0;
  return { signedIn: sessionExpiresAt > Date.now(), sessionExpiresAt };
}
export async function saveSession(data: SessionData) {
  if (!data?.user?.id || !data.session?.access_token || !data.session.refresh_token ||
      !(Date.parse(data.session.access_expires_at) > Date.now()) ||
      !(Date.parse(data.session.refresh_expires_at) > Date.now())) throw new Error("Invalid authentication response.");
  // Keep backend credentials in separate encrypted cookies, bound to the Zuwara identity.
  await writeCookie(SESSION, { user: data.user, session: {
    access_token: data.session.access_token, access_expires_at: data.session.access_expires_at,
    refresh_token: data.session.refresh_token, refresh_expires_at: data.session.refresh_expires_at,
  } }, new Date(data.session.refresh_expires_at));
  const linked = data.connections?.d4h;
  const d4h = linked?.session;
  if (linked?.available && d4h?.access_token && Number.isSafeInteger(d4h.user_id) && d4h.user_id > 0 && Date.parse(d4h.expires_at) > Date.now()) {
    await writeCookie(D4H_SESSION, { identity: data.user.id, user_id: d4h.user_id, access_token: d4h.access_token, expires_at: d4h.expires_at }, new Date(d4h.expires_at));
  } else { (await cookies()).delete(D4H_SESSION); }
}
export async function readD4hSession(): Promise<D4hSession | null> {
  const primary = await readSession();
  if (!primary) return null;
  const linked = await readCookie<D4hSession & { identity: string }>(D4H_SESSION);
  if (!linked?.access_token || linked.identity !== primary.user.id || !(Date.parse(linked.expires_at) > Date.now())) return null;
  return { user_id: linked.user_id, access_token: linked.access_token, expires_at: linked.expires_at };
}
export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION); jar.delete(D4H_SESSION);
}
export async function readPending() {
  const pending = await readCookie<PendingOtp>(PENDING);
  return pending && pending.pendingUntil > Date.now() ? pending : null;
}
export async function savePending(value: PendingOtp) { await writeCookie(PENDING, value, new Date(value.pendingUntil)); }
export async function clearPending() { (await cookies()).delete(PENDING); }
export async function requireSession() {
  const locale = await getLocale();
  const prefix = locale === "ar" ? "/ar" : "";
  const data = await readSession();
  if (!data) redirect(`${prefix}/login-page`);
  if (Date.parse(data.session.access_expires_at) <= Date.now() + 15_000) redirect(`${prefix}/login-page?reason=session-expired`);
  return data;
}
export async function patientApi<T>(path: string, options: Parameters<typeof zuwaraV2<T>>[1] = {}) {
  const data = await requireSession();
  const locale = options.locale ?? await getLocale();
  try { return await zuwaraV2<T>(path, { ...options, token: data.session.access_token, locale }); }
  catch (error) {
    if (error instanceof ZuwaraV2Error && error.status === 401) redirect(`${locale === "ar" ? "/ar" : ""}/login-page?reason=session-expired`);
    throw error;
  }
}