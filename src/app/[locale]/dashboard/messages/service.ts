import "server-only";
import {
  allAppointments,
  startsAt,
  type AppointmentResource,
} from "@/lib/api/zuwara/appointments";
import { chatHistory } from "@/lib/api/zuwara/chat";
import { requireSession } from "@/lib/auth/session";
import type { ActionResult, Conversation, ConversationDetail } from "./types";
function conversation(row: AppointmentResource, locale: string): Conversation {
  return {
    id: String(row.id),
    provider: {
      id: row.doctor ? String(row.doctor.id) : "",
      name:
        (locale === "ar" ? row.doctor?.name_ar : null) ||
        row.doctor?.name ||
        row.appointment_number,
      specialty: "",
      avatarUrl: row.doctor?.image_url || undefined,
    },
    lastMessage: null,
    lastFrom: null,
    lastAt: null,
    unreadCount: null,
    appointmentNumber: row.appointment_number,
    appointmentAt: startsAt(row) || null,
    appointmentStatus: row.status.key,
  };
}
export async function getConversations(
  locale: string,
): Promise<Conversation[]> {
  const rows = await allAppointments();
  return rows
    .filter((row) => row.status.code !== 7)
    .sort(
      (a, b) =>
        (startsAt(b) || b.created_at).localeCompare(
          startsAt(a) || a.created_at,
        ) || b.id - a.id,
    )
    .map((row) => conversation(row, locale));
}
export async function getUnreadMessagesCount(): Promise<number | null> {
  await requireSession();
  return null;
}
export async function getConversation(
  id: string,
  locale: string,
): Promise<ConversationDetail | null> {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const row = (await allAppointments()).find(
    (row) => String(row.id) === id && row.status.code !== 7,
  );
  if (!row) return null;
  const page = await chatHistory(id);
  return {
    ...conversation(row, locale),
    messages: page.messages.map((message) => ({
      id: message.id,
      from: message.sender.role === "patient" ? "me" : "them",
      body: message.deleted ? "Message deleted" : message.text || "",
      createdAt: message.created_at || "",
    })),
    nextCursor: page.nextCursor,
    canSend: page.canSend,
  };
}
// Text delivery is available only through the appointment chat actions with a stable retry key.
export async function sendMessage(
  id: string,
  body: string,
): Promise<ActionResult> {
  void id;
  void body;
  await requireSession();
  return { ok: false, error: "generic" };
}
export async function markConversationRead(id: string): Promise<ActionResult> {
  void id;
  await requireSession();
  return { ok: false, error: "generic" };
}
