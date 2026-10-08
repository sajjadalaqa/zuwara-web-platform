"use server";

import { revalidatePath } from "next/cache";
import { markAllRead, markRead } from "./service";
import type { ActionResult } from "./types";

// TODO (backend): check the session on the server in both actions.

export async function markReadAction(id: string): Promise<ActionResult> {
  const res = await markRead(id);
  if (res.ok) revalidatePath("/", "layout"); // refreshes the header badge
  return res;
}

export async function markAllReadAction(): Promise<ActionResult> {
  const res = await markAllRead();
  if (res.ok) revalidatePath("/", "layout");
  return res;
}