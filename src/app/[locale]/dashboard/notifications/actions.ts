"use server";

import { visitMarkDisplayed } from "@/lib/api/d4h/notifications";
import { revalidatePath } from "next/cache";
import { markAllRead, markRead } from "./service";
import type { ActionResult } from "./types";

// TODO (backend): check the session on the server in both actions.

export async function markReadAction(id: string, read = true): Promise<ActionResult> {
  const res = await markRead(id, read);
  if (res.ok) revalidatePath("/", "layout"); // refreshes the header badge
  return res;
}

export async function markAllReadAction(through: number): Promise<ActionResult> {
  const res = await markAllRead(through);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}
export async function markDisplayedReadAction(ids:string[]):Promise<ActionResult>{try{await visitMarkDisplayed(ids);revalidatePath("/","layout");return {ok:true};}catch{return {ok:false,error:"READ_UPDATE_FAILED"};}}
