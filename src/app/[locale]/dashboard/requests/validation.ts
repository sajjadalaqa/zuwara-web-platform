import { CATEGORIES } from "./types";
import type { ErrorCode, FieldName, RequestInput } from "./types";

// If you change a limit, update the matching text in copy.ts too.
export const LIMITS = {
  titleMin: 5, titleMax: 80,
  descMin: 10, descMax: 1000,
  cityMax: 60,
  budgetMin: 10, budgetMax: 100000,
};

// "YYYY-MM-DD" in Saudi time, so server and browser agree on "today".
export function todayInRiyadh(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(new Date());
}

export function validateRequest(i: RequestInput) {
  const e: Partial<Record<FieldName, ErrorCode>> = {};

  if (!(CATEGORIES as readonly string[]).includes(i.category)) e.category = "invalid_category";

  const title = i.title.trim();
  if (!title) e.title = "required";
  else if (title.length < LIMITS.titleMin) e.title = "too_short";
  else if (title.length > LIMITS.titleMax) e.title = "too_long";

  const desc = i.description.trim();
  if (!desc) e.description = "required";
  else if (desc.length < LIMITS.descMin) e.description = "too_short";
  else if (desc.length > LIMITS.descMax) e.description = "too_long";

  const city = i.city.trim();
  if (!city) e.city = "required";
  else if (city.length > LIMITS.cityMax) e.city = "too_long";

  const date = i.preferredDate;
  if (!date) {
    e.preferredDate = "required";
  } else {
    const d = new Date(`${date}T00:00:00Z`);
    const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(+d) && d.toISOString().slice(0, 10) === date;
    if (!validDate) {
      e.preferredDate = "invalid_date";
    } else {
      const today = todayInRiyadh();
      const max = new Date(`${today}T00:00:00Z`);
      max.setUTCFullYear(max.getUTCFullYear() + 1);
      if (date < today) e.preferredDate = "past_date";
      else if (date > max.toISOString().slice(0, 10)) e.preferredDate = "too_far";
    }
  }

  if (i.budget) {
    const ok =
      /^\d{1,6}$/.test(i.budget) &&
      Number(i.budget) >= LIMITS.budgetMin &&
      Number(i.budget) <= LIMITS.budgetMax;
    if (!ok) e.budget = "invalid_budget";
  }

  return e;
}