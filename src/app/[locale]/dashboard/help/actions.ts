"use server";

import { createTicket } from "./service";
import type { FormState } from "./types";
import { validateTicket } from "./validation";

export async function sendMessageAction(_prev: FormState, fd: FormData): Promise<FormState> {
  // TODO (backend): check the session on the server before creating the ticket.
  const input = {
    topic: String(fd.get("topic") ?? ""),
    message: String(fd.get("message") ?? "").trim(),
  };

  const errors = validateTicket(input);
  if (Object.keys(errors).length) return { ok: false, errors };

  const res = await createTicket(input);
  if (!res.ok) return { ok: false, errors: { _form: res.code } };

  return { ok: true };
}