import { CATEGORIES } from "./types";
import type { ComplaintInput, ErrorCode, FieldName } from "./types";

// If you change a limit, update the matching text in copy.ts too.
export const LIMITS = {
  subjectMin: 5, subjectMax: 80,
  descMin: 20, descMax: 1500,
  replyMin: 3, replyMax: 1000,
};

export function validateComplaint(i: ComplaintInput) {
  const e: Partial<Record<FieldName, ErrorCode>> = {};

  if (!(CATEGORIES as readonly string[]).includes(i.category)) e.category = "invalid_category";

  const subject = i.subject.trim();
  if (!subject) e.subject = "required";
  else if (subject.length < LIMITS.subjectMin) e.subject = "too_short";
  else if (subject.length > LIMITS.subjectMax) e.subject = "too_long";

  const desc = i.description.trim();
  if (!desc) e.description = "required";
  else if (desc.length < LIMITS.descMin) e.description = "too_short";
  else if (desc.length > LIMITS.descMax) e.description = "too_long";

  const ref = i.relatedRef.trim();
  if (ref && !/^[A-Za-z0-9-]{3,20}$/.test(ref)) e.relatedRef = "invalid_reference";

  return e;
}

export function validateReply(message: string): ErrorCode | null {
  const m = message.trim();
  if (!m) return "required";
  if (m.length < LIMITS.replyMin) return "too_short";
  if (m.length > LIMITS.replyMax) return "too_long";
  return null;
}