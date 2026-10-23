"use client";
import { useState, useRef, useId } from "react";
import { Search, Check, X, CalendarDays } from "lucide-react";
import s from "./requests-ui.module.css";
export default function RequestFields({
  services,
  ar,
}: {
  services: { id: number; name: string }[];
  ar: boolean;
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState<number[]>([]),
    [error, setError] = useState(false);
  const group = useRef<HTMLDivElement>(null),
    searchId = useId(),
    errorId = useId();
  const matches = services.filter((r) =>
    r.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  function toggle(id: number) {
    setError(false);
    setSelected((old) =>
      old.includes(id)
        ? old.filter((n) => n !== id)
        : old.length < 20
          ? [...old, id]
          : old,
    );
  }
  return (
    <>
      <div className={s.fieldsRow}>
        <label className={s.field}>
          <span>
            {ar
              ? "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0637\u0644\u0628"
              : "Request title"}{" "}
            <i>*</i>
          </span>
          <input
            name="title"
            required
            maxLength={150}
            placeholder={
              ar
                ? "\u0645\u062b\u0627\u0644: \u0623\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0645\u0633\u0627\u0639\u062f\u0629 \u0641\u064a \u0627\u0644\u0645\u0646\u0632\u0644"
                : "e.g. Help arranging a home service"
            }
          />
        </label>
        <label className={s.field}>
          <span>
            <CalendarDays size={14} />
            {ar
              ? "\u0627\u0644\u062a\u0627\u0631\u064a\u062e \u0627\u0644\u0645\u0641\u0636\u0644"
              : "Preferred date"}
            <small>
              {ar ? "\u0627\u062e\u062a\u064a\u0627\u0631\u064a" : "Optional"}
            </small>
          </span>
          <input name="preferred_date" type="date" />
        </label>
      </div>
      <label className={s.field}>
        <span>
          {ar
            ? "\u0643\u064a\u0641 \u064a\u0645\u0643\u0646\u0646\u0627 \u0645\u0633\u0627\u0639\u062f\u062a\u0643\u061f"
            : "How can we help?"}{" "}
          <i>*</i>
        </span>
        <textarea
          name="description"
          required
          maxLength={5000}
          rows={3}
          placeholder={
            ar
              ? "\u0623\u0636\u0641 \u0648\u0635\u0641\u0627\u064b \u0644\u0644\u062e\u062f\u0645\u0629 \u0627\u0644\u062a\u064a \u062a\u062d\u062a\u0627\u062c\u0647\u0627 \u0648\u0623\u064a \u062a\u0641\u0627\u0635\u064a\u0644 \u0645\u0641\u064a\u062f\u0629."
              : "Describe the service you need and any details that will help us understand your request."
          }
        />
      </label>
      <div className={s.serviceField} ref={group}>
        <div className={s.selectorHead}>
          <label htmlFor={searchId}>
            {ar
              ? "\u0627\u062e\u062a\u0631 \u0627\u0644\u062e\u062f\u0645\u0627\u062a"
              : "Choose your services"}{" "}
            <i>*</i>
          </label>
          <span>
            {selected.length}/20 {ar ? "\u0645\u062d\u062f\u062f" : "selected"}
          </span>
        </div>
        <p className={s.hint}>
          {ar
            ? "\u0627\u062e\u062a\u0631 \u062e\u062f\u0645\u0629 \u0648\u0627\u062d\u062f\u0629 \u0623\u0648 \u0623\u0643\u062b\u0631 \u062a\u0646\u0627\u0633\u0628 \u0627\u062d\u062a\u064a\u0627\u062c\u0627\u062a\u0643."
            : "Select one or more services that match your request."}
        </p>
        <div className={s.selector}>
          <div className={s.search}>
            <Search size={16} />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                ar
                  ? "\u0627\u0628\u062d\u062b \u0639\u0646 \u062e\u062f\u0645\u0629"
                  : "Search available services"
              }
              autoComplete="off"
            />
          </div>
          <div
            className={s.options}
            role="group"
            aria-label={
              ar
                ? "\u0627\u0644\u062e\u062f\u0645\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629"
                : "Available services"
            }
          >
            {matches.length ? (
              matches.map((r) => (
                <label className={s.option} key={r.id}>
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggle(r.id)}
                    disabled={
                      selected.length === 20 && !selected.includes(r.id)
                    }
                  />
                  <span className={s.checkbox}>
                    <Check size={12} />
                  </span>
                  <span>{r.name}</span>
                </label>
              ))
            ) : (
              <p className={s.noResults}>
                {ar
                  ? "\u0644\u0627 \u062a\u0648\u062c\u062f \u062e\u062f\u0645\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0644\u0628\u062d\u062b."
                  : "No matching services. Try another search."}
              </p>
            )}
          </div>
        </div>
        <select
          name="service_ids"
          multiple
          required
          value={selected.map(String)}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          className={s.validationSelect}
          onInvalid={(e) => {
            e.preventDefault();
            setError(true);
            group.current?.scrollIntoView({ block: "center" });
          }}
          aria-describedby={error ? errorId : undefined}
        >
          {services.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {error && (
          <p className={s.error} id={errorId} role="alert">
            {ar
              ? "\u064a\u0631\u062c\u0649 \u0627\u062e\u062a\u064a\u0627\u0631 \u062e\u062f\u0645\u0629 \u0648\u0627\u062d\u062f\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644."
              : "Please select at least one service."}
          </p>
        )}
        {selected.length > 0 && (
          <div className={s.selected}>
            {selected.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                aria-label={
                  (ar ? "\u0625\u0632\u0627\u0644\u0629 " : "Remove ") +
                  services.find((r) => r.id === id)?.name
                }
              >
                {services.find((r) => r.id === id)?.name}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
