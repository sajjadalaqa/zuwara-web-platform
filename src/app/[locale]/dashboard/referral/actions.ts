"use server";

import { revalidatePath } from "next/cache";
import { redeemPoints } from "./service";
import type { RedeemState } from "./types";
import { validateRedeem } from "./validation";

export async function redeemAction(_prev: RedeemState, fd: FormData): Promise<RedeemState> {
  // TODO (backend): check the session on the server first.
  const raw = String(fd.get("points") ?? "");

  const error = validateRedeem(raw);
  if (error) return { ok: false, error };

  const res = await redeemPoints(Number(raw));
  if (!res.ok) return { ok: false, error: res.code };

  revalidatePath("/", "layout"); // refreshes the wallet balance everywhere
  return { ok: true, credited: res.credited };
}