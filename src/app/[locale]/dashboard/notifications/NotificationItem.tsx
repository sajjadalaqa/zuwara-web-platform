"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Bell, CalendarCheck, FileText, MessageSquare, Wallet } from "lucide-react";
import { markReadAction } from "./actions";
import type { NotificationKind } from "./types";
import s from "./notifications.module.css";

const icons = {
  appointment: CalendarCheck,
  payment: Wallet,
  request: FileText,
  message: MessageSquare,
  system: Bell,
} as const;

const tones = {
  appointment: s.tPurple,
  payment: s.tRose,
  request: s.tIndigo,
  message: s.tMint,
  system: s.tAmber,
} as const;

type Props = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string; // full path, already including the locale prefix
};

export default function NotificationItem({ id, kind, title, body, time, read, href }: Props) {
  const router = useRouter();
  const [, start] = useTransition();
  const Icon = icons[kind];
  const cls = `${s.item} ${read ? "" : s.unread}`;

  const content = (
    <>
      <span className={`${s.icon} ${tones[kind]}`}><Icon size={17} /></span>
      <span className={s.text}>
        <h3>{title}</h3>
        <p>{body}</p>
      </span>
      <span className={s.meta}>
        <span className={s.time}>{time}</span>
        {!read && <span className={s.dot} aria-hidden="true" />}
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cls}
        onClick={() => {
          if (!read) markReadAction(id).catch(() => {});
        }}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        if (read) return;
        start(async () => {
          await markReadAction(id);
          router.refresh();
        });
      }}
    >
      {content}
    </button>
  );
}