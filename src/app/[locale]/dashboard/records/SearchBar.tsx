"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { CategoryFilter } from "./types";
import s from "./records.module.css";

export default function SearchBar({
  q, category, placeholder, clearLabel,
}: {
  q: string;
  category: CategoryFilter;
  placeholder: string;
  clearLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(q);
  const first = useRef(true);

  // debounced search -> URL (keeps the category, resets the page)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => {
      const u = new URLSearchParams();
      if (category !== "all") u.set("category", category);
      if (value.trim()) u.set("q", value.trim());
      const qs = u.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
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
  );
}