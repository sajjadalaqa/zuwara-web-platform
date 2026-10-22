import { randomUUID } from "node:crypto";
import { readSession, readD4hSession } from "@/lib/auth/session";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; locale: string }> },
) {
  const { id, locale } = await params,
    headers = {
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      Vary: "Cookie",
    };
  const session = await readSession();
  if (!session || Date.parse(session.session.access_expires_at) <= Date.now())
    return new Response("Unauthorized", { status: 401, headers });
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
  )
    return new Response("Not found", { status: 404, headers });
  const value = new URL(req.url).searchParams.get("source");
  if (value !== "zuwara" && value !== "d4h")
    return new Response("Not found", { status: 404, headers });
  const linked = value === "d4h" ? await readD4hSession() : null;
  if (value === "d4h" && !linked)
    return new Response("Source unavailable", { status: 503, headers });
  const base =
    value === "d4h"
      ? (process.env.D4H_V2_API_BASE_URL ??
        "https://dashboardvisit.zuwara.sa/api/platform/v2")
      : (process.env.ZUWARA_V2_API_BASE_URL ??
        "https://dashboard.zuwara.sa/api/platform/v2");
  try {
    const upstream = await fetch(
      base.replace(/\/$/, "") + "/patient-documents/" + id + "/download",
      {
        headers: {
          Accept: "application/pdf",
          Authorization:
            "Bearer " + (linked?.access_token ?? session.session.access_token),
          lang: locale === "ar" ? "ar" : "en",
          "X-Request-ID": randomUUID(),
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(30000),
      },
    );
    if (!upstream.ok)
      return new Response("Document unavailable", {
        status: [401, 403, 404, 429].includes(upstream.status)
          ? upstream.status
          : 503,
        headers,
      });
    if (
      !upstream.body ||
      !upstream.headers.get("content-type")?.startsWith("application/pdf")
    )
      return new Response("Document unavailable", { status: 503, headers });
    const max = 10 * 1024 * 1024;
    if (Number(upstream.headers.get("content-length")) > max) {
      await upstream.body.cancel();
      return new Response("Document unavailable", { status: 503, headers });
    }
    let bytes = 0;
    const bounded = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > max) {
          controller.error(Error("Document exceeds size limit."));
          return;
        }
        controller.enqueue(chunk);
      },
    });
    return new Response(upstream.body.pipeThrough(bounded), {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="patient-document-' + id + '.pdf"',
      },
    });
  } catch {
    return new Response("Document unavailable", { status: 503, headers });
  }
}
