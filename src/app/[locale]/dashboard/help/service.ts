import { cache } from "react";
import { FAQS, SUPPORT } from "./mock"; // TODO (backend): delete this import
import { FAQ_CATEGORIES } from "./types";
import type {
  CategoryFilter, FaqFilters, FaqResult, ServiceResult, SupportInfo, TicketInput,
} from "./types";

export async function getFaqs(filters: FaqFilters, locale: string): Promise<FaqResult> {
  // TODO (backend): replace the body with
  // const qs = new URLSearchParams({ q: filters.q, category: filters.category });
  // const res = await fetch(`${process.env.API_URL}/faqs?${qs}`, {
  //   headers: { "Accept-Language": locale },
  //   next: { revalidate: 300 }, // FAQs rarely change, so a short cache is fine
  // });
  // if (!res.ok) throw new Error("Failed to load FAQs");
  // return (await res.json()) as FaqResult;
  const lang = locale === "ar" ? "ar" : "en";
  const q = filters.q.trim().toLowerCase();

  const matched = FAQS.filter(
    (f) => !q || `${f[lang].question} ${f[lang].answer}`.toLowerCase().includes(q)
  );

  const counts = {
    all: matched.length,
    ...Object.fromEntries(
      FAQ_CATEGORIES.map((c) => [c, matched.filter((f) => f.category === c).length])
    ),
  } as Record<CategoryFilter, number>;

  const filtered =
    filters.category === "all" ? matched : matched.filter((f) => f.category === filters.category);

  return {
    items: filtered.map((f) => ({
      id: f.id,
      category: f.category,
      question: f[lang].question,
      answer: f[lang].answer,
    })),
    counts,
  };
}

export const getSupportInfo = cache(async (locale: string): Promise<SupportInfo> => {
  // TODO (backend): GET `${API_URL}/support-info` (or keep it in your site settings)
  const lang = locale === "ar" ? "ar" : "en";
  return {
    email: SUPPORT.email,
    phone: SUPPORT.phone,
    whatsapp: SUPPORT.whatsapp,
    hours: SUPPORT.hours[lang],
  };
});

export async function createTicket(input: TicketInput): Promise<ServiceResult> {
  // TODO (backend): POST `${API_URL}/support/tickets` { topic, message }
  // The ticket should be linked to the signed-in user, and replies go to their account email.
  // Map API errors to codes: 429 -> { ok:false, code:"rate_limited" }.
  void input;
  return { ok: true };
}