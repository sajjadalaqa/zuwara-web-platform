import "server-only";
import { getLocale } from "next-intl/server";
import { readD4hSession, requireSession } from "@/lib/auth/session";
import { d4hV2, D4hV2Error } from "./v2";
export async function d4hPatientApi<T>(path: string, options: Parameters<typeof d4hV2<T>>[1] = {}) {
  await requireSession();
  const session = await readD4hSession();
  if (!session) throw new D4hV2Error(503, "D4H_SESSION_UNAVAILABLE");
  // A Zuwara access token must never be sent to D4H.
  return d4hV2<T>(path, { ...options, token: session.access_token, locale: options.locale ?? await getLocale() });
}