"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { sendMessageAction } from "./actions";
import type { Copy } from "./copy";
import { TOPICS, initialFormState } from "./types";
import { LIMITS } from "./validation";
import s from "./help.module.css";

export default function ContactForm({ t }: { t: Copy }) {
  const [state, action, pending] = useActionState(sendMessageAction, initialFormState);
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [showOk, setShowOk] = useState(false);

  // success: clear the form and show the confirmation until the user types again
  useEffect(() => {
    if (state.ok) {
      setTopic("");
      setMessage("");
      setShowOk(true);
    }
  }, [state]);

  const err = (key: "topic" | "message" | "_form") => {
    const code = state.errors?.[key];
    return code ? t.errors[code] : undefined;
  };
  const f = t.form;

  return (
    <form action={action} className={s.form} noValidate>
      {showOk && (
        <p className={s.bannerOk} role="status">
          <CheckCircle2 size={16} />
          {f.sent}
        </p>
      )}
      {err("_form") && <p className={s.bannerErr} role="alert">{err("_form")}</p>}

      <div className={s.field}>
        <label htmlFor="topic" className={s.label}>{f.topic}</label>
        <select
          id="topic" name="topic" className={s.input}
          value={topic}
          onChange={(e) => { setTopic(e.target.value); setShowOk(false); }}
          aria-invalid={!!err("topic")}
        >
          <option value="">{f.topicPlaceholder}</option>
          {TOPICS.map((tp) => (
            <option key={tp} value={tp}>{f.topics[tp]}</option>
          ))}
        </select>
        {err("topic") && <p className={s.error} role="alert">{err("topic")}</p>}
      </div>

      <div className={s.field}>
        <label htmlFor="message" className={s.label}>{f.message}</label>
        <div className={s.counterWrap}>
          <textarea
            id="message" name="message" className={`${s.input} ${s.textarea}`}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setShowOk(false); }}
            maxLength={LIMITS.messageMax} rows={5} placeholder={f.placeholder}
            aria-invalid={!!err("message")}
          />
          <span className={s.counter}>{message.length}/{LIMITS.messageMax}</span>
        </div>
        {err("message") && <p className={s.error} role="alert">{err("message")}</p>}
      </div>

      <button type="submit" className={s.submit} disabled={pending}>
        {pending ? f.sending : f.submit}
      </button>
    </form>
  );
}