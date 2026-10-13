import { cache } from "react";
import { getStore, scheduleReply, settleReplies, type StoredConversation } from "./mock"; // TODO (backend): delete this import
import type { ActionResult, Conversation, ConversationDetail } from "./types";

const summarize = (c: StoredConversation): Conversation => {
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id,
    provider: c.provider,
    lastMessage: last?.body ?? "",
    lastFrom: last?.from ?? "them",
    lastAt: last?.createdAt ?? new Date(0).toISOString(),
    unreadCount: c.unreadCount,
  };
};

export async function getConversations(locale: string): Promise<Conversation[]> {
  // TODO (backend): replace the body with
  // const res = await fetch(`${process.env.API_URL}/me/conversations`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error("Failed to load conversations");
  // return (await res.json()) as Conversation[];   // newest first
  // (Add ?page= and a "load more" button later if users have hundreds of chats.)
  void locale;
  settleReplies();
  return getStore().conversations
    .map(summarize)
    .sort((a, b) => +new Date(b.lastAt) - +new Date(a.lastAt));
}

// Used by the sidebar badge. cache() = one fetch per request.
export const getUnreadMessagesCount = cache(async (): Promise<number> => {
  // TODO (backend): GET `${API_URL}/me/conversations/unread-count`
  settleReplies();
  return getStore().conversations.reduce((n, c) => n + c.unreadCount, 0);
});

export async function getConversation(
  id: string,
  locale: string
): Promise<ConversationDetail | null> {
  // TODO (backend): replace the body with
  // const res = await fetch(`${process.env.API_URL}/conversations/${id}`, {
  //   headers: { Authorization: `Bearer ${await getToken()}`, "Accept-Language": locale },
  //   cache: "no-store",
  // });
  // if (res.status === 404) return null;            // shows the not-found screen
  // if (!res.ok) throw new Error("Failed to load conversation");
  // return (await res.json()) as ConversationDetail; // messages oldest first
  void locale;
  settleReplies();
  const c = getStore().conversations.find((x) => x.id === id);
  return c ? { ...summarize(c), messages: structuredClone(c.messages) } : null;
}

export async function sendMessage(id: string, body: string): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/conversations/${id}/messages` { body }
  // 404 -> { ok:false, error:"not_found" }
  const c = getStore().conversations.find((x) => x.id === id);
  if (!c) return { ok: false, error: "not_found" };
  c.messages.push({
    id: `m_${Date.now()}`,
    from: "me",
    body: body.trim(),
    createdAt: new Date().toISOString(),
  });
  scheduleReply(id); // mock only
  return { ok: true };
}

export async function markConversationRead(id: string): Promise<ActionResult> {
  // TODO (backend): POST `${API_URL}/conversations/${id}/read`
  const c = getStore().conversations.find((x) => x.id === id);
  if (!c) return { ok: false, error: "not_found" };
  c.unreadCount = 0;
  return { ok: true };
}