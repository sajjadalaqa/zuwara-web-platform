"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type FormEvent, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { sendMessageAction } from "../actions";
import { MAX_MESSAGE } from "../validation";
import s from "../messages.module.css";

export default function Composer({
  conversationId, placeholder, sendLabel, errors,
}: {
  conversationId: string;
  placeholder: string;
  sendLabel: string;
  errors: Record<string, string>;
}) {
  const router = useRouter();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  // grow with the text, up to a limit
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const submit = () => {
    const body = text.trim();
    if (!body || pending) return;
    setError("");
    start(async () => {
      try {
        const res = await sendMessageAction(conversationId, body);
        if (res.ok) {
          setText("");
          router.refresh();
          ref.current?.focus();
        } else {
          setError(errors[res.error] ?? errors.generic);
        }
      } catch {
        setError(errors.generic);
      }
    });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends, Shift+Enter adds a new line. Skip while an IME is composing (Arabic, etc.).
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={onSubmit} className={s.composerWrap}>
      {error && <p className={s.composeError} role="alert">{error}</p>}
      <div className={s.composer}>
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          maxLength={MAX_MESSAGE}
          enterKeyHint="send"
          placeholder={placeholder}
          aria-label={placeholder}
          className={s.field}
        />
        <button
          type="submit"
          className={s.sendBtn}
          disabled={pending || !text.trim()}
          aria-label={sendLabel}
          title={sendLabel}
        >
          <Send size={18} className={s.rtlFlip} />
        </button>
      </div>
    </form>
  );
}