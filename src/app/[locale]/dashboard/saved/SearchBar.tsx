"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import s from "./saved.module.css";

export default function SearchBar({
  q, placeholder, clearLabel,
}: {
  q: string;
  placeholder: string;
  clearLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [value, setValue] = useState(q);
  const first = useRef(true);

  // debounced search -> URL (page resets to 1)
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const id = setTimeout(() => {
      const query = value.trim();
      router.replace(query ? `${pathname}?q=${encodeURIComponent(query)}` : pathname, { scroll: false });
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