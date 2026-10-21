"use server";
import { attendance, videoSession, videoStatus } from "@/lib/api/zuwara/video";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
export async function startVideoAction(id: string) {
  try { return { ok: true as const, session: await videoSession(id) }; }
  catch (error) { if (error instanceof ZuwaraV2Error) return { ok: false as const }; throw error; }
}
export async function attendanceAction(meetingId: string, token: string, type: string, eventId: string) {
  try { await attendance(meetingId, token, type, eventId); return { ok: true }; }
  catch (error) { if (error instanceof ZuwaraV2Error) return { ok: false }; throw error; }
}

export async function videoEligibilityAction(id: string) {
  try { return { ok: true as const, canJoin: (await videoStatus(id)).can_join }; }
  catch(error) { if(error instanceof ZuwaraV2Error)return{ok:false as const};throw error; }
}

