"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { markAllReadAction } from "./actions";
import s from "./notifications.module.css";

export default function MarkAllButton({ label, disabled }: { label: string; disabled: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      className={s.markAll}
      disabled={disabled || pending}
      onClick={() =>
        start(async () => {
          const res = await markAllReadAction();
          if (res.ok) router.refresh();
        })
      }
    >
      <CheckCheck size={16} />
      {label}
    </button>
  );
}