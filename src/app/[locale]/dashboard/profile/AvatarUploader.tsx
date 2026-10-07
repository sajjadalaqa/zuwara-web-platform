"use client";

import { useRef, useState, useTransition, type ChangeEvent } from "react";
import { Camera } from "lucide-react";
import { removeAvatarAction, uploadAvatarAction } from "./actions";
import type { Copy } from "./copy";
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_BYTES } from "./validation";
import s from "./profile.module.css";

export default function AvatarUploader({
  name, avatarUrl, t,
}: {
  name: string;
  avatarUrl?: string;
  t: Copy;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, start] = useTransition();
  const [error, setError] = useState("");

  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) return setError(t.errors.bad_type);
    if (file.size > MAX_AVATAR_BYTES) return setError(t.errors.too_large);

    setError("");
    start(async () => {
      const fd = new FormData();
      fd.set("avatar", file);
      const res = await uploadAvatarAction(fd);
      if (!res.ok) setError(t.errors[res.errors?.avatar ?? "generic"]);
    });
  };

  const onRemove = () => {
    setError("");
    start(async () => {
      const res = await removeAvatarAction();
      if (!res.ok) setError(t.errors[res.errors?.avatar ?? "generic"]);
    });
  };

  return (
    <div className={s.avatarCol}>
      <div className={s.avatarWrap}>
        <div className={s.avatarCircle}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={name} />
          ) : (
            name.trim().charAt(0).toUpperCase()
          )}
        </div>
        {busy && <span className={s.spin} />}
        <button
          type="button"
          className={s.camBtn}
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          aria-label={t.avatar.change}
        >
          <Camera size={14} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={onPick}
        />
      </div>

      {avatarUrl && (
        <button type="button" className={s.removeBtn} onClick={onRemove} disabled={busy}>
          {t.avatar.remove}
        </button>
      )}
      {error && <p className={s.avatarError} role="alert">{error}</p>}
    </div>
  );
}