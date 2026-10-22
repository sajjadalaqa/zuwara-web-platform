"use server";
import { requireSession } from "@/lib/auth/session";

import { revalidatePath } from "next/cache";
import { markConversationRead, sendMessage } from "./service";
import type { ActionResult } from "./types";
import { validateMessage } from "./validation";

// TODO (backend): check the session on the server in both actions, and make sure the
// conversation belongs to the signed-in user.

export async function sendMessageAction(
  conversationId: string,
  body: string,
): Promise<ActionResult> {
  await requireSession();

  const error = validateMessage(body);
  if (error) return { ok: false, error };

  const res = await sendMessage(conversationId, body);
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

export async function markReadAction(
  conversationId: string,
): Promise<ActionResult> {
  await requireSession();

  const res = await markConversationRead(conversationId);
  if (res.ok) revalidatePath("/", "layout"); // refreshes the sidebar badge
  return res;
}
