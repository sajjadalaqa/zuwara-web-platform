import "server-only";
import { randomUUID } from "node:crypto";

export type V2Envelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    request_id?: string;
    unread_count?: number;
    read_all_through?: number;
    pagination?: { current_page: number; per_page: number; total: number; last_page: number; has_more: boolean };
  };
};
export class ZuwaraV2Error extends Error {
  constructor(public status: number, public code = "API_UNAVAILABLE", public requestId?: string, public validationFields: string[] = [], public consultationTypeHint?: string) {
    super(`Zuwara request failed: ${code}`);
    this.name = "ZuwaraV2Error";
  }
}
export async function zuwaraV2<T>(path: string, options: {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  locale?: string;
  idempotencyKey?: string;
} = {}): Promise<V2Envelope<T>> {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) throw new Error("Invalid API path");
  const base = (process.env.ZUWARA_V2_API_BASE_URL ?? "https://dashboard.zuwara.sa/api/platform/v2").replace(/\/$/, "");
  const response = await fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json", ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      "X-Request-ID": randomUUID(), lang: options.locale === "ar" ? "ar" : "en",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    ...(options.body !== undefined ? { body: options.body instanceof FormData ? options.body : JSON.stringify(options.body) } : {}),
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success !== true) {
    const fields = new Set<string>();
    let consultationTypeHint: string | undefined;
    const bookingFields = new Set(["doctor_id", "patient_id", "date", "time", "duration_minutes", "consultation_type", "problem", "payment_method", "coupon_id", "coupon_code"]);
    function collectFields(value: unknown, depth = 0) {
      if (!value || typeof value !== "object" || depth > 6) return;
      for (const [key, child] of Object.entries(value)) {
        if (bookingFields.has(key)) fields.add(key);
        if (key === "consultation_type") {
          const messages = Array.isArray(child) ? child : [child];
          const message = messages.find(value => typeof value === "string");
          if (typeof message === "string" && /(?:\bconsultation(?:_| )type\b|^This consultant does not offer [a-z_]+ consultations\.?$)/i.test(message)) consultationTypeHint = message.slice(0, 300);
        }
        if ((key === "field" || key === "path") && typeof child === "string" && bookingFields.has(child)) fields.add(child);
        collectFields(child, depth + 1);
      }
    }
    collectFields(payload?.error);
    collectFields(payload?.errors);
    throw new ZuwaraV2Error(response.status, payload?.error?.code ?? "API_UNAVAILABLE", payload?.meta?.request_id, [...fields], consultationTypeHint);
  }
  return payload as V2Envelope<T>;
}
export function getZuwaraV2<T>(path: string, locale = "en") {
  return zuwaraV2<T>(path, { locale });
}
