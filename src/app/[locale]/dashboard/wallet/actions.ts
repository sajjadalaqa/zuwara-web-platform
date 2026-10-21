"use server";
import { requireSession } from "@/lib/auth/session";

import { revalidatePath } from "next/cache";
import { createTopUp } from "./service";
import type { TopUpState } from "./types";
import { validateAmount } from "./validation";

export async function topUpAction(_prev: TopUpState, fd: FormData): Promise<TopUpState> {
  await requireSession();
  const raw = String(fd.get("amount") ?? "").trim();

  const error = validateAmount(raw);
  if (error) return { ok: false, error, value: raw };

  const res = await createTopUp(Number(raw));
  if (!res.ok) return { ok: false, error: res.error, value: raw };

  revalidatePath("/", "layout"); // refreshes the Overview wallet card too
  return { ok: true, paymentUrl: res.paymentUrl };
}
export async function confirmRechargeAction(): Promise<void> {
  await requireSession();
  const { confirmRecharge } = await import("@/lib/api/zuwara/recharges");
  const { redirect } = await import("next/navigation");
  const { getLocale } = await import("next-intl/server");
  const locale = await getLocale();
  try { await confirmRecharge(); } catch (error) {
    const { ZuwaraV2Error } = await import("@/lib/api/zuwara/v2");
    if (!(error instanceof ZuwaraV2Error)) throw error;
    redirect((locale === "ar" ? "/ar" : "") + "/dashboard/wallet?verification=pending");
  }
  revalidatePath("/", "layout");
}
