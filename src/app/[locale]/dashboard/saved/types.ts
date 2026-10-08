export type ServiceKind = "consultation" | "visit" | "instant";

export type SavedProvider = {
  id: string;
  name: string;
  specialty: string;
  city: string;
  rating: number; // 0 to 5
  reviewsCount: number;
  priceFrom: number;
  currency: string; // "SAR"
  services: ServiceKind[];
  availableToday: boolean;
  avatarUrl?: string;
  savedAt: string; // ISO 8601
};

export type SavedFilters = { q: string; page: number };

export type SavedResult = {
  items: SavedProvider[];
  total: number;
  page: number;
  pageSize: number;
};

export type ActionResult = { ok: true } | { ok: false; error: string };