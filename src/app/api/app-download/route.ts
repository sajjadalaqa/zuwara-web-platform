import { appDownloadDestination } from "@/lib/app-download";

export function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("lang") === "ar" ? "ar" : "en";
  return new Response(null, {
    status: 307,
    headers: {
      Location: appDownloadDestination(request.headers.get("user-agent") ?? "", locale),
      "Cache-Control": "private, no-store",
      Vary: "User-Agent",
      "X-Robots-Tag": "noindex",
    },
  });
}
