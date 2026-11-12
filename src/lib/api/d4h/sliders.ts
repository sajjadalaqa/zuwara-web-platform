import "server-only";
import { unstable_rethrow } from "next/navigation";
import { d4hV2 } from "./v2";
import { pagination } from "@/lib/api/pagination";
import type { HeroSlide } from "@/data/hero-slides";

type Slider = { id: number; title: string; type: string | null; type_id: number | null; status: number; description: string | null; service_name: string | null; slider_image: string | null };

function destination(type: string | null, id: number | null): string | undefined {
  if (!Number.isSafeInteger(id) || Number(id) < 1) return undefined;
  switch (type) {
    case "service": return "/provider?service_id=" + id;
    case "category": return "/home-services?category_id=" + id;
    case "provider": return "/provider/" + id;
    default: return undefined;
  }
}
function imageUrl(value: string | null): string {
  try {
    const url = new URL(value || "", process.env.D4H_V2_API_BASE_URL ?? "https://dashboardvisit.zuwara.sa/api/platform/v2");
    const permitted = url.protocol === "https:" && !url.username && !url.password && !url.port && (
      (url.hostname === "dashboardvisit.zuwara.sa" && /^\/(storage|images)\//.test(url.pathname)) ||
      (url.hostname === "dashboard.zuwara.sa" && /^\/(storage|asset)\//.test(url.pathname))
    );
    return permitted ? url.href : "/images/hero-1.jpg";
  } catch { return "/images/hero-1.jpg"; }
}

/** Null means unavailable; an empty array means the API intentionally has no active banners. */
export async function getD4hSlides(locale: string): Promise<HeroSlide[] | null> {
  try {
    const slides: HeroSlide[] = [], seen = new Set<number>();
    for (let page = 1; page <= 100; page++) {
      const payload = await d4hV2<Slider[]>("/sliders?per_page=50&page=" + page, { locale });
      const paging = pagination(payload);
      if (paging.current_page !== page) throw new Error("Invalid slider pagination.");
      let added = 0;
      for (const row of payload.data) {
        if (!Number.isSafeInteger(row.id) || row.id < 1) throw new Error("Invalid slider.");
        if (seen.has(row.id)) continue;
        seen.add(row.id); added++;
        if (row.status !== 1) continue;
        const title = typeof row.title === "string" && row.title.trim() ? row.title.trim() : typeof row.service_name === "string" && row.service_name.trim() ? row.service_name.trim() : "Zuwara";
        slides.push({ id: row.id, label: { en: title, ar: title }, alt: { en: title, ar: title }, image: imageUrl(row.slider_image), fit: "contain", href: destination(row.type, row.type_id), ratio: "8 / 3" });
      }
      if (!paging.has_more) return slides;
      if (!added) throw new Error("Invalid slider pagination.");
    }
    throw new Error("Slider pagination limit exceeded.");
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}
