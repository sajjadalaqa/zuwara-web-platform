import { randomUUID } from "node:crypto";
import { readSession, readD4hSession } from "@/lib/auth/session";
import { reportPath } from "@/lib/api/reports";
export async function GET(req: Request, { params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", Vary: "Cookie" };
  const session = await readSession();
  if (!session || Date.parse(session.session.access_expires_at) <= Date.now()) return new Response("Unauthorized", { status: 401, headers });
  const report = reportPath(id);
  if (!report) return new Response("Not found", { status: 404, headers });
  const linked = report.source === "d4h" ? await readD4hSession() : null;
  if (report.source === "d4h" && !linked) return new Response("Report source unavailable", { status: 503, headers });
  const base = report.source === "d4h" ? process.env.D4H_V2_API_BASE_URL ?? "https://dashboardvisit.zuwara.sa/api/platform/v2"
    : process.env.ZUWARA_V2_API_BASE_URL ?? "https://dashboard.zuwara.sa/api/platform/v2";
  const download = new URL(req.url).searchParams.get("download") === "1";
  try {
    const upstream = await fetch(base.replace(/\/$/, "") + report.path + (download ? "" : "?inline=1"), {
      headers: { Accept: "application/pdf", Authorization: "Bearer " + (linked?.access_token ?? session.session.access_token),
        lang: locale === "ar" ? "ar" : "en", "X-Request-ID": randomUUID() },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30_000),
    });
    if (!upstream.ok) return new Response("Report unavailable", { status: [401, 403, 404, 429].includes(upstream.status) ? upstream.status : 503, headers });
    if (!upstream.headers.get("content-type")?.startsWith("application/pdf") || !upstream.body) return new Response("Report unavailable", { status: 503, headers });
    const max = 20 * 1024 * 1024;
    if (Number(upstream.headers.get("content-length")) > max) { await upstream.body.cancel(); return new Response("Report unavailable", { status: 503, headers }); }
    let bytes = 0;
    const bounded = new TransformStream<Uint8Array, Uint8Array>({ transform(chunk, controller) {
      bytes += chunk.byteLength; if (bytes > max) { controller.error(new Error("Report exceeds size limit.")); return; } controller.enqueue(chunk);
    } });
    return new Response(upstream.body.pipeThrough(bounded), { headers: { ...headers, "Content-Type": "application/pdf",
      "Content-Disposition": (download ? "attachment" : "inline") + '; filename="' + report.filename + '"' } });
  } catch { return new Response("Report unavailable", { status: 503, headers }); }
}
