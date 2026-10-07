"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { STATUSES, type StatusFilter } from "./types";
import { number } from "./format";
import s from "./appointments.module.css";

type Props = {
  locale: string;
  status: StatusFilter;
  q: string;
  counts: Record<StatusFilter, number>;
  labels: Record<StatusFilter, string>;
  placeholder: string;
  clearLabel: string;
};

const ORDER: StatusFilter[] = ["all", ...STATUSES];

export default function Toolbar({
  locale, status, q, counts, labels, placeholder, clearLabel,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(q);
  const first = useRef(true);

  const build = (st: StatusFilter, query: string) => {
    const p = new URLSearchParams();
    if (st !== "all") p.set("status", st);
    if (query.trim()) p.set("q", query.trim());
    const qs = p.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  // debounced search -> URL (page resets to 1)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => router.replace(build(status, value), { scroll: false }), 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={s.toolbar}>
      <nav className={s.tabs} aria-label="Status">
        {ORDER.map((st) => (
          <Link
            key={st}
            href={build(st, value)}
            scroll={false}
            className={`${s.tab} ${st === status ? s.tabActive : ""}`}
          >
            <span>{labels[st]}</span>
            <span className={s.count}>{number(counts[st] ?? 0, locale)}</span>
          </Link>
        ))}
      </nav>

      <div className={s.search}>
        <Search size={17} className={s.searchIcon} />
        <input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
        />
        {value && (
          <button type="button" className={s.clear} onClick={() => setValue("")} aria-label={clearLabel}>
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}