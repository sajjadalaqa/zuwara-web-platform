import type { Message, Provider, Sender } from "./types";

export type StoredConversation = {
  id: string;
  provider: Provider;
  unreadCount: number;
  messages: Message[];
};

type Pending = { conversationId: string; body: string; dueAt: number };
type Store = { conversations: StoredConversation[]; pending: Pending[] };

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;

// TODO (backend): delete this file.
function seed(): Store {
  let n = 0;
  const m = (from: Sender, body: string, ago: number): Message => ({
    id: `m${++n}`,
    from,
    body,
    createdAt: new Date(Date.now() - ago).toISOString(),
  });

  return {
    pending: [],
    conversations: [
      {
        id: "conv_1",
        provider: { id: "p2", name: "Dr. Khalid Al-Harbi", specialty: "General Medicine" },
        unreadCount: 2,
        messages: [
          m("me", "Hello doctor, thank you for accepting my appointment.", 2 * D),
          m("them", "You're welcome! Please have your recent test results ready for the call.", 2 * D - 5 * MIN),
          m("me", "Of course. Should I upload them to my medical records?", D + 3 * H),
          m("them", "Yes please, that would help a lot.", D + 3 * H - 10 * MIN),
          m("them", "Also, remember you can join the call 10 minutes early.", 30 * MIN),
          m("them", "See you tomorrow!", 28 * MIN),
        ],
      },
      {
        id: "conv_2",
        provider: { id: "p4", name: "Nora Al-Shehri", specialty: "Home Nursing" },
        unreadCount: 1,
        messages: [
          m("me", "Hello Nora, thank you for confirming the home visit.", D + 2 * H),
          m("them", "My pleasure! I'll arrive around 11:00 tomorrow. Is the address on the booking correct?", 3 * H),
        ],
      },
      {
        id: "conv_3",
        provider: { id: "p1", name: "Dr. Sara Al-Qahtani", specialty: "Dermatology" },
        unreadCount: 0,
        messages: [
          m("me", "Thank you for the consultation, the cream is working well.", 3 * D),
          m("them", "Glad to hear it! Continue for another week, then let me know how it looks.", 3 * D - H),
        ],
      },
      {
        id: "conv_4",
        provider: { id: "p6", name: "Dr. Layla Al-Ghamdi", specialty: "Nutrition" },
        unreadCount: 0,
        messages: [
          m("them", "Here's your updated nutrition plan for week 2.", 5 * D),
          m("me", "Perfect, thank you!", 5 * D - 20 * MIN),
        ],
      },
      {
        id: "conv_5",
        provider: { id: "p5", name: "Dr. Faisal Al-Mutairi", specialty: "Pediatrics" },
        unreadCount: 0,
        messages: [
          m("them", "Please bring your son's vaccination card to the next visit.", 8 * D),
          m("me", "Will do, thank you.", 8 * D - 15 * MIN),
        ],
      },
    ],
  };
}

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraMessages: Store | undefined;
}

export function getStore(): Store {
  if (!globalThis.__zuwaraMessages) globalThis.__zuwaraMessages = seed();
  return globalThis.__zuwaraMessages;
}

// Mock only: the provider "replies" a few seconds after you send, so you can
// see polling and unread badges working. Your backend does this for real.
export function scheduleReply(conversationId: string) {
  getStore().pending.push({
    conversationId,
    body: "Thanks for your message! I'll get back to you shortly.",
    dueAt: Date.now() + 7000,
  });
}

export function settleReplies() {
  const store = getStore();
  const now = Date.now();
  const due = store.pending.filter((p) => p.dueAt <= now);
  if (!due.length) return;
  store.pending = store.pending.filter((p) => p.dueAt > now);
  for (const p of due) {
    const c = store.conversations.find((x) => x.id === p.conversationId);
    if (!c) continue;
    c.messages.push({
      id: `m_${p.dueAt}`,
      from: "them",
      body: p.body,
      createdAt: new Date(p.dueAt).toISOString(),
    });
    c.unreadCount += 1;
  }
}