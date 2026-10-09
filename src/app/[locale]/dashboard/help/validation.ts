import { TOPICS } from "./types";
import type { ErrorCode, TicketInput } from "./types";

// If you change a limit, update the matching text in copy.ts too.
export const LIMITS = { messageMin: 10, messageMax: 1000 };

export function validateTicket(i: TicketInput) {
  const e: Partial<Record<"topic" | "message", ErrorCode>> = {};

  if (!(TOPICS as readonly string[]).includes(i.topic)) e.topic = "invalid_topic";

  const m = i.message.trim();
  if (!m) e.message = "required";
  else if (m.length < LIMITS.messageMin) e.message = "too_short";
  else if (m.length > LIMITS.messageMax) e.message = "too_long";

  return e;
}