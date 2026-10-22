"use server";
import { chatHistory, sendChat } from "@/lib/api/zuwara/chat";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
export async function chatHistoryAction(id: string, cursor?: string, followUpId?: string) {
  try { return { ok: true as const, page: await chatHistory(id, cursor, followUpId) }; }
  catch (error) { if (error instanceof ZuwaraV2Error) return { ok: false as const }; throw error; }
}
export async function sendChatAction(id: string, text: string, key: string, followUpId?: string) {
  try { return { ok: true as const, message: await sendChat(id, text, key, followUpId) }; }
  catch (error) { if (error instanceof ZuwaraV2Error) return { ok: false as const, uncertain: error.status >= 500 || error.status === 409 }; throw error; }
}
