"use server";

import { revalidatePath } from "next/cache";
import { createTopUp } from "./service";
import type { TopUpState } from "./types";
import { validateAmount } from "./validation";

export async function topUpAction(_prev: TopUpState, fd: FormData): Promise<TopUpState> {
  // TODO (backend): check the session on the server first.
  const raw = String(fd.get("amount") ?? "").trim();

  const error = validateAmount(raw);
  if (error) return { ok: false, error, value: raw };

  const res = await createTopUp(Number(raw));
  if (!res.ok) return { ok: false, error: res.error, value: raw };

  revalidatePath("/", "layout"); // refreshes the Overview wallet card too
  return { ok: true, paymentUrl: res.paymentUrl };
}