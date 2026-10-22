"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { IAgoraRTCClient, IMicrophoneAudioTrack, ICameraVideoTrack } from "agora-rtc-sdk-ng";
import type { VideoSession } from "@/lib/api/zuwara/video";
import { startVideoAction, attendanceAction, videoEligibilityAction } from "./actions";
import s from "./video.module.css";
export default function VideoCall({ id, canJoin, followUpId }: { id: string; canJoin: boolean; followUpId?: string }) {
  const ar = useLocale() === "ar";
  const local = useRef<HTMLDivElement>(null), remote = useRef<HTMLDivElement>(null);
  const client = useRef<IAgoraRTCClient | null>(null), tracks = useRef<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const session = useRef<VideoSession | null>(null), timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generation = useRef(0), mounted = useRef(true);
  const [state, setState] = useState<"idle" | "joining" | "connected">("idle"), [error, setError] = useState("");
  async function event(type: string) {
    const active = session.current;
    if (!active) return;
    const eventId = crypto.randomUUID();
    try {
      const result = await attendanceAction(active.meeting_id, active.attendance_token, type, eventId);
      if (!result.ok && type !== "heartbeat") await attendanceAction(active.meeting_id, active.attendance_token, type, eventId);
    } catch { /* Attendance failure does not assert clinical completion. */ }
  }
  async function leave(update = true) {
    generation.current++;
    if (endTimer.current) {clearTimeout(endTimer.current);endTimer.current=null;}
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    const rtc = client.current, leaving = session.current; client.current = null; session.current = null;
    tracks.current?.forEach(track => { track.stop(); track.close(); }); tracks.current = null;
    if (rtc) { rtc.removeAllListeners(); await rtc.leave().catch(() => {}); }
    if (leaving) { try { await attendanceAction(leaving.meeting_id, leaving.attendance_token, "left", crypto.randomUUID()); } catch { /* The backend will expire presence. */ } }
    if (update && mounted.current) setState("idle");
  }
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; void leave(false); };
  }, []);
  async function join() {
    setError(""); setState("joining"); const attempt = ++generation.current;
    try {
      const result = await startVideoAction(id, followUpId);
      if (!result.ok) throw new Error("Session unavailable");
      if (!mounted.current || attempt !== generation.current) return;
      const sdk = (await import("agora-rtc-sdk-ng")).default;
      if (!mounted.current || attempt !== generation.current) return;
      const rtc = sdk.createClient({ mode: "rtc", codec: "vp8" }); client.current = rtc; session.current = result.session;
      rtc.on("user-published", async (user, media) => {
        try {
          await rtc.subscribe(user, media);
          if (client.current !== rtc) return;
          if (media === "video" && remote.current) user.videoTrack?.play(remote.current);
          if (media === "audio") user.audioTrack?.play();
          await event("remote_participant_seen");
        } catch { if (mounted.current) setError(ar ? "تعذر الاتصال بمقدم الرعاية." : "Unable to connect to the other participant."); }
      });
      rtc.on("connection-state-change", (current, previous) => {
        if (client.current !== rtc) return;
        if ((current === "RECONNECTING" || current === "DISCONNECTED") && (previous === "CONNECTED" || previous === "RECONNECTING")) void event("connection_lost");
        if (current === "CONNECTED" && previous === "RECONNECTING") void event("connection_restored");
      });
      rtc.on("user-left", () => { void event("remote_participant_left"); });
      rtc.on("token-privilege-will-expire", async () => {
        try {
          const renewed = await startVideoAction(id, followUpId);
          if (!renewed.ok || renewed.session.meeting_id !== session.current?.meeting_id || renewed.session.channel_name !== session.current.channel_name) throw new Error("Session ended");
          await rtc.renewToken(renewed.session.token); session.current = renewed.session;
        } catch { await leave(); if (mounted.current) setError(ar ? "انتهت الجلسة." : "The session ended."); }
      });
      rtc.on("token-privilege-did-expire", () => { void leave(); });
      await rtc.join(result.session.app_id, result.session.channel_name, result.session.token, result.session.agora_uid);
      if (!mounted.current || attempt !== generation.current) { await rtc.leave(); return; }
      const media = await sdk.createMicrophoneAndCameraTracks();
      if (!mounted.current || attempt !== generation.current) { media.forEach(t => t.close()); await rtc.leave(); return; }
      tracks.current = media;
      if (local.current) media[1].play(local.current);
      await rtc.publish(media); await event("joined");
      if (mounted.current) setState("connected");
      const closes = result.session.context_ends_at;
      if (closes && Number.isFinite(Date.parse(closes))) endTimer.current = setTimeout(() => void leave(), Math.max(0, Date.parse(closes)-Date.now()));
      timer.current = setInterval(() => {
        const ends = session.current?.context_ends_at;
        if (ends && Date.now() >= Date.parse(ends)) { void leave(); return; }
        if (rtc.connectionState === "CONNECTED") void event("heartbeat");
        void videoEligibilityAction(id, followUpId).then(status=>{if(status.ok && !status.canJoin && client.current===rtc)void leave();}).catch(()=>{});
      }, 30_000);
    } catch {
      if (attempt !== generation.current) return;
      await leave();
      if (mounted.current) setError(ar ? "تعذر بدء المكالمة. تحقق من صلاحيات الكاميرا والميكروفون وأهلية الموعد." : "Unable to start the call. Check camera/microphone permissions and appointment eligibility.");
    }
  }
  return <section className={s.call}>
    <div className={s.grid}><div ref={local} className={s.video} aria-label={ar ? "الكاميرا الخاصة بك" : "Your camera"} /><div ref={remote} className={s.video} aria-label={ar ? "مقدم الرعاية" : "Care provider"} /></div>
    {error && <p role="alert">{error}</p>}
    {state === "idle" ? <button disabled={!canJoin} onClick={join}>{canJoin ? ar ? "بدء المكالمة" : "Join call" : ar ? "المكالمة غير متاحة لهذا الموعد" : "This appointment is not eligible to join"}</button>
      : <button onClick={() => void leave()}>{state === "joining" ? ar ? "إلغاء الاتصال" : "Cancel connection" : ar ? "مغادرة المكالمة" : "Leave call"}</button>}
  </section>;
}




