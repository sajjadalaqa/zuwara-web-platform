"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { MessagesSquare, Search, X } from "lucide-react";
import s from "./messages.module.css";

export type ListItem = {
  id: string;
  name: string;
  avatarUrl?: string;
  preview: string;
  time: string;
  unread: number | null;
};

type Labels = {
  title: string;
  search: string;
  clear: string;
  noMatch: string;
  emptyTitle: string;
  emptyText: string;
  emptyCta: string;
};

const initialOf = (name: string) =>
  name
    .replace(/^(Dr\.?|د\.)\s*/i, "")
    .charAt(0)
    .toUpperCase();

export default function MessagesShell({
  items,
  labels,
  children,
}: {
  items: ListItem[];
  labels: Labels;
  children: ReactNode;
}) {
  const params = useParams<{ id?: string; locale?: string }>();
  const activeId = params?.id;
  const prefix = params?.locale === "ar" ? "/ar" : "";
  const [q, setQ] = useState("");
  const [failedAvatars, setFailedAvatars] = useState<Set<string>>(
    () => new Set(),
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter((i) =>
      `${i.name} ${i.preview}`.toLowerCase().includes(term),
    );
  }, [items, q]);

  // No conversations at all: one friendly empty card instead of a split view.
  if (items.length === 0 && !activeId) {
    return (
      <div className={s.emptyWrap}>
        <span className={s.phIcon}>
          <MessagesSquare size={28} />
        </span>
        <h3>{labels.emptyTitle}</h3>
        <p>{labels.emptyText}</p>
        <Link href={`${prefix}/provider`} className={s.cta}>
          {labels.emptyCta}
        </Link>
      </div>
    );
  }

  return (
    <div className={s.wrap} data-open={activeId ? "true" : "false"}>
      <aside className={s.list}>
        <div className={s.listHead}>
          <h2>{labels.title}</h2>
          <div className={s.search}>
            <Search size={16} className={s.searchIcon} />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={labels.search}
              aria-label={labels.search}
            />
            {q && (
              <button
                type="button"
                className={s.clear}
                onClick={() => setQ("")}
                aria-label={labels.clear}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={s.noMatch}>{labels.noMatch}</p>
        ) : (
          <ul className={s.items}>
            {filtered.map((i) => (
              <li key={i.id}>
                <Link
                  href={`${prefix}/dashboard/messages/${i.id}`}
                  className={`${s.item} ${i.id === activeId ? s.itemActive : ""} ${(i.unread ?? 0) > 0 ? s.unread : ""}`}
                  aria-current={i.id === activeId ? "page" : undefined}
                >
                  <span className={s.avatar}>
                    {i.avatarUrl && !failedAvatars.has(i.id) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={i.avatarUrl}
                        alt=""
                        onError={() =>
                          setFailedAvatars(
                            (previous) => new Set([...previous, i.id]),
                          )
                        }
                      />
                    ) : (
                      initialOf(i.name)
                    )}
                  </span>
                  <span className={s.itemBody}>
                    <span className={s.itemTop}>
                      <h3>{i.name}</h3>
                      <small>{i.time}</small>
                    </span>
                    <span className={s.itemBottom}>
                      <p className={s.preview}>{i.preview}</p>
                      {(i.unread ?? 0) > 0 && (
                        <span className={s.badge}>
                          {(i.unread ?? 0) > 9 ? "9+" : i.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={s.pane}>{children}</section>
    </div>
  );
}
