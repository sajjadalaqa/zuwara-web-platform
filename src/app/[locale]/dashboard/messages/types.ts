export type Provider = {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
};

export type Sender = "me" | "them";

export type Message = {
  id: string;
  from: Sender;
  body: string; // user-written text, not translated
  createdAt: string; // ISO 8601
};

export type Conversation = {
  id: string;
  provider: Provider;
  lastMessage: string;
  lastFrom: Sender;
  lastAt: string; // ISO 8601
  unreadCount: number;
};

export type ConversationDetail = Conversation & { messages: Message[] }; // oldest first

// The server returns codes; the UI translates them (see copy.ts).
export type ErrorCode = "required" | "too_long" | "not_found" | "generic";

export type ActionResult = { ok: true } | { ok: false; error: ErrorCode };