import "server-only";
import { randomUUID } from "node:crypto";
import type { V2Envelope } from "@/lib/api/zuwara/v2";

export class D4hV2Error extends Error {
  constructor(public status: number, public code = "D4H_UNAVAILABLE", public requestId?: string, public validationFields:string[] = []) {
    super(`D4H request failed: ${code}`);
    this.name = "D4hV2Error";
  }
}
export async function d4hV2<T>(path: string, options: {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
  locale?: string;
  idempotencyKey?: string;
} = {}): Promise<V2Envelope<T>> {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) throw new Error("Invalid API path");
  const base = (process.env.D4H_V2_API_BASE_URL ?? "https://dashboardvisit.zuwara.sa/api/platform/v2").replace(/\/$/, "");
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
    const fields=new Set<string>();
    const allowed=/^(?:provider_id|address_id|zone_id|date|time|duration_minutes|description|services(?:\.\d+(?:\.(?:service_id|quantity))?)?|packages(?:\.\d+(?:\.(?:package_id|quantity))?)?)$/;
    function collect(value:unknown,depth=0){if(!value||typeof value!=="object"||depth>6)return;for(const [key,child]of Object.entries(value)){if(allowed.test(key))fields.add(key);if((key==="field"||key==="path")&&typeof child==="string"&&allowed.test(child))fields.add(child);collect(child,depth+1);}}
    collect(payload?.error);collect(payload?.errors);
    throw new D4hV2Error(response.status,payload?.error?.code??"D4H_UNAVAILABLE",payload?.meta?.request_id,[...fields]);
  }
  return payload as V2Envelope<T>;
}