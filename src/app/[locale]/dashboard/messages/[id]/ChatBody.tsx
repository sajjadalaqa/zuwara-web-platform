"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { markReadAction } from "../actions";
import s from "../messages.module.css";

const POLL_MS = 15_000;

export default function ChatBody({
  conversationId, unread, count, children,
}: {
  conversationId: string;
  unread: number;
  count: number;
  children: ReactNode;
}) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // scroll to the newest message (instantly on open, smoothly after that)
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: first.current ? "auto" : "smooth" });
    first.current = false;
  }, [count]);

  // opening a chat marks it as read (this also clears the sidebar badge)
  useEffect(() => {
    if (unread <= 0) return;
    let cancelled = false;
    markReadAction(conversationId)
      .then((res) => { if (!cancelled && res.ok) router.refresh(); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [conversationId, unread, router]);

  // pick up new messages every few seconds while the tab is visible.
  // TODO (backend): swap for WebSockets or server-sent events for instant delivery.
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) router.refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [router]);

  return (
    <div ref={ref} className={s.body}>
      {children}
    </div>
  );
}