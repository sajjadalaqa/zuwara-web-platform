"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import s from "./consultant-select.module.css";

type ConsultantOption = { id: number; name: string };
export function filterConsultantOptions(options: ConsultantOption[], query: string) {
  const search = query.trim().toLocaleLowerCase();
  return options.filter(option => option.name.toLocaleLowerCase().includes(search));
}

export default function ConsultantSelect({ options, value, onChange, ar, disabled }: {
  options: ConsultantOption[]; value: string; onChange: (value: string) => void; ar: boolean; disabled: boolean;
}) {
  const id = useId(), root = useRef<HTMLDivElement>(null), input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false), [query, setQuery] = useState(""), [active, setActive] = useState(0);
  const selected = options.find(option => String(option.id) === value);
  const matches = filterConsultantOptions(options, query);
  const selectMessage = ar ? "يرجى اختيار استشاري من القائمة." : "Please select a consultant from the list.";

  useEffect(() => { input.current?.setCustomValidity(!selected && query ? selectMessage : ""); }, [selected, query, selectMessage]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("focusin", outside); };
  }, [open]);
  useEffect(() => {
    if (open) root.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open, query]);

  function choose(option: ConsultantOption) {
    onChange(String(option.id)); setQuery("");
    input.current?.setCustomValidity(""); input.current?.focus(); setOpen(false);
  }
  return <div className={s.field} ref={root}>
    <label htmlFor={id}>{ar ? "الاستشاري" : "Consultant"}</label>
    <div className={s.control} data-open={open}>
      <Search size={16} className={s.searchIcon} aria-hidden="true" />
      <input id={id} ref={input} className={s.input} type="text" role="combobox" required disabled={disabled} autoComplete="off"
        aria-autocomplete="list" aria-expanded={open} aria-controls={id + "-options"}
        aria-activedescendant={open && matches[active] ? id + "-option-" + matches[active].id : undefined}
        placeholder={ar ? "ابحث أو اختر استشارياً" : "Search or select a consultant"}
        value={open ? query || selected?.name || "" : selected?.name ?? ""}
        onFocus={event => { setQuery(""); setActive(0); setOpen(true); event.currentTarget.select(); }}
        onChange={event => { setQuery(event.target.value); onChange(""); setActive(0); setOpen(true); event.currentTarget.setCustomValidity(event.target.value ? selectMessage : ""); }}
        onKeyDown={event => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault(); setOpen(true);
            setActive(current => !open ? 0 : Math.max(0, Math.min(matches.length - 1, current + (event.key === "ArrowDown" ? 1 : -1))));
          } else if (event.key === "Enter" && open) {
            event.preventDefault(); if (matches[active]) choose(matches[active]);
          } else if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
          else if (event.key === "Tab") setOpen(false);
        }} />
      <button type="button" className={s.toggle} tabIndex={-1} disabled={disabled} aria-label={ar ? "عرض قائمة الاستشاريين" : "Show consultant options"}
        onClick={() => { const next = !open; setQuery(""); setActive(0); input.current?.focus(); setOpen(next); }}><ChevronDown size={16} aria-hidden="true" /></button>
    </div>
    {open && <div className={s.menu}>
      <div className={s.hint}>{ar ? "ابحث بالاسم أو اختر من القائمة" : "Type a name or select from the list"}<span>{matches.length}</span></div>
      <ul id={id + "-options"} className={s.options} role="listbox" aria-label={ar ? "الاستشاريون" : "Consultants"}>
        {matches.map((option, index) => <li key={option.id} id={id + "-option-" + option.id} role="option" tabIndex={-1}
          aria-selected={String(option.id) === value} data-active={index === active} onMouseDown={event => event.preventDefault()}
          onMouseEnter={() => setActive(index)} onClick={() => choose(option)}><span>{option.name}</span>{String(option.id) === value && <Check size={16} aria-hidden="true" />}</li>)}
        {!matches.length && <li className={s.empty} role="presentation">{ar ? "لا يوجد استشاري مطابق للبحث." : "No consultants match your search."}</li>}
      </ul>
    </div>}
  </div>;
}
