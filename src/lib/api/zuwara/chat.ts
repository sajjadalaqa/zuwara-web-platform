import "server-only";
import { uuid } from "./care";
import { patientApi } from "@/lib/auth/session";
export type ChatMessage = { id: string; type: string; text: string | null; sender: { id: number | string; role: string; name: string }; created_at: string | null; deleted: boolean; attachment_url: string | null };
export type ChatPage = { messages: ChatMessage[]; canSend: boolean; nextCursor: string | null };
function idPath(id: string) {
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) throw new Error("Invalid appointment.");
  return "/appointments/" + id + "/chat/messages";
}
function message(row: ChatMessage): ChatMessage {
  if (typeof row.id !== "string" || !row.sender || typeof row.sender.name !== "string") throw new Error("Invalid chat message.");
  let attachment: string | null = null;
  if (!row.deleted && row.attachment_url) { const url = new URL(row.attachment_url); if (url.protocol === "https:" && !url.username && !url.password) attachment = url.href; }
  return { id: row.id, type: row.type, text: row.deleted ? null : row.text, sender: { id: row.sender.id, role: row.sender.role, name: row.sender.name },
    created_at: row.created_at, deleted: row.deleted, attachment_url: attachment };
}
export async function chatHistory(id: string, cursor?: string, followUpId?: string): Promise<ChatPage> {
  if (cursor && cursor.length > 8192) throw new Error("Invalid chat cursor.");
  const query = new URLSearchParams({ per_page: "20", ...(cursor ? { cursor } : {}), ...(followUpId ? { follow_up_id: uuid(followUpId) } : {}) });
  const payload = await patientApi<{ messages: ChatMessage[]; can_send: boolean }>(idPath(id) + "?" + query);
  const p = payload.meta?.pagination as unknown as { has_more: boolean; next_cursor: string | null } | undefined;
  if (!Array.isArray(payload.data.messages) || !p || typeof p.has_more !== "boolean" ||
      p.has_more && typeof p.next_cursor !== "string") throw new Error("Invalid chat response.");
  return { messages: payload.data.messages.map(message), canSend: payload.data.can_send, nextCursor: p.has_more ? p.next_cursor : null };
}
export async function sendChat(id: string, text: string, key: string, followUpId?: string): Promise<ChatMessage> {
  if (typeof text !== "string" || !text.trim() || text.length > 4000 || !/^[a-f0-9-]{36}$/i.test(key)) throw new Error("Invalid message.");
  const { data } = await patientApi<{ message: ChatMessage }>(idPath(id), { method: "POST", body: { message: text, ...(followUpId ? { follow_up_id: uuid(followUpId) } : {}) }, idempotencyKey: key });
  return message(data.message);
}
