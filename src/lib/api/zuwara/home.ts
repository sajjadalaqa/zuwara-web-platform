import "server-only";
import { consultantCategories, discovery, doctorView, type V2Doctor } from "./discovery";
import type { ZuwaraHomeData } from "./types";
import { ZuwaraV2Error } from "./v2";
export async function getZuwaraHomeData(): Promise<ZuwaraHomeData> {
  try {
    const [categories, doctors] = await Promise.all([consultantCategories().catch(() => []), discovery<V2Doctor[]>("/consultants?per_page=6")]);
    if (!Array.isArray(doctors.data)) throw new Error("Invalid consultant list.");
    return { categories, doctors: doctors.data.map(doctorView), available: true };
  } catch (error) {
    if (error instanceof ZuwaraV2Error || error instanceof TypeError) return { categories: [], doctors: [], available: false };
    throw error;
  }
}
