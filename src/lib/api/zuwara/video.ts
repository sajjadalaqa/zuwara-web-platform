import "server-only";
import { patientApi } from "@/lib/auth/session";
export type VideoSession = {
  meeting_id: string; appointment_id: number; channel_name: string; agora_uid: number;
  token: string; app_id: string; expires_at: string; attendance_token: string;
  context_ends_at: string | null;
};
export async function videoStatus(id: string) {
  if (!/^[1-9]\d*$/.test(id)) throw new Error("Invalid appointment.");
  return (await patientApi<{ can_join: boolean; context_ends_at: string | null }>("/appointments/" + id + "/video")).data;
}
export async function videoSession(id: string): Promise<VideoSession> {
  if (!/^[1-9]\d*$/.test(id)) throw new Error("Invalid appointment.");
  const { data } = await patientApi<VideoSession>("/appointments/" + id + "/video/session", { method: "POST", body: {} });
  if (data.appointment_id !== Number(id) || !data.meeting_id || !data.channel_name || !Number.isSafeInteger(data.agora_uid) ||
      !data.token || !data.app_id || !data.attendance_token || !(Date.parse(data.expires_at) > Date.now())) throw new Error("Invalid video session.");
  return data;
}
export async function attendance(meetingId: string, token: string, type: string, eventId: string) {
  if (!/^[A-Za-z0-9-]{1,100}$/.test(meetingId) || typeof token !== "string" || token.length > 8192 ||
      !/^[a-f0-9-]{36}$/i.test(eventId) || !["joined", "heartbeat", "left", "connection_lost", "connection_restored", "remote_participant_seen", "remote_participant_left", "call_ended"].includes(type)) throw new Error("Invalid attendance event.");
  await patientApi("/video/meetings/" + meetingId + "/events", { method: "POST",
    body: { event_id: eventId, event_type: type, attendance_token: token, occurred_at: new Date().toISOString(), app_version: "web-1.0" } });
}
