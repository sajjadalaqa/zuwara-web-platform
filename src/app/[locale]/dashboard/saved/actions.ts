"use server";

import { revalidatePath } from "next/cache";
import { removeSaved } from "./service";
import type { ActionResult } from "./types";

export async function removeSavedAction(id: string): Promise<ActionResult> {
  // TODO (backend): check the session on the server before doing anything.
  const res = await removeSaved(id);
  if (res.ok) revalidatePath("/", "layout"); // also refreshes the Overview count
  return res;
}