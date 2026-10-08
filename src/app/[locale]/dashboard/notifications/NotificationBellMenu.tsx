"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CalendarCheck,
  CheckCheck,
  FileText,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { markAllReadAction, markReadAction } from "./actions";
import type { NotificationKind } from "./types";
import s from "./bell.module.css";

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

type Item = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string; // already includes the locale prefix
};

type Props = {
  items: Item[];
  unreadCount: number;
  viewAllHref: string;
  labels: {
    title: string;
    markAll: string;
    viewAll: string;
    empty: string;
    ariaLabel: string;
  };
};

export default function NotificationBellMenu({ items, unreadCount, viewAllHref, labels }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const renderContent = (n: Item) => {
    const Icon = icons[n.kind];
    return (
      <>
        <span className={`${s.icon} ${tones[n.kind]}`}>
          <Icon size={16} />
        </span>
        <span className={s.text}>
          <strong>{n.title}</strong>
          <span>{n.body}</span>
        </span>
        <span className={s.meta}>
          <span className={s.time}>{n.time}</span>
          {!n.read && <span className={s.dot} aria-hidden="true" />}
        </span>
      </>
    );
  };

  return (
    <div className={s.wrap} ref={wrapRef}>
      <button
        type="button"
        className={s.bell}
        aria-label={labels.ariaLabel}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className={s.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className={s.panel} role="menu">
          <div className={s.panelHead}>
            <h3>{labels.title}</h3>
            <button
              type="button"
              className={s.markAll}
              disabled={unreadCount === 0 || pending}
              onClick={() =>
                start(async () => {
                  const res = await markAllReadAction();
                  if (res.ok) router.refresh();
                })
              }
            >
              <CheckCheck size={14} />
              {labels.markAll}
            </button>
          </div>

          {items.length === 0 ? (
            <div className={s.empty}>
              <BellOff size={24} />
              <p>{labels.empty}</p>
            </div>
          ) : (
            <ul className={s.list}>
              {items.map((n) => (
                <li key={n.id}>
                  {n.href ? (
                    <Link
                      href={n.href}
                      className={`${s.item} ${n.read ? "" : s.unread}`}
                      onClick={() => {
                        if (!n.read) markReadAction(n.id).catch(() => {});
                        setOpen(false);
                      }}
                    >
                      {renderContent(n)}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`${s.item} ${n.read ? "" : s.unread}`}
                      onClick={() => {
                        if (n.read) return;
                        start(async () => {
                          await markReadAction(n.id);
                          router.refresh();
                        });
                      }}
                    >
                      {renderContent(n)}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}

          <Link href={viewAllHref} className={s.viewAll} onClick={() => setOpen(false)}>
            {labels.viewAll}
          </Link>
        </div>
      )}
    </div>
  );
}