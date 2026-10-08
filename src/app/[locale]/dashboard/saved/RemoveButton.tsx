"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { removeSavedAction } from "./actions";
import s from "./saved.module.css";

export default function RemoveButton({
  id, label, failedLabel,
}: {
  id: string;
  label: string;
  failedLabel: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [failed, setFailed] = useState(false);

  const onClick = () => {
    setFailed(false);
    start(async () => {
      try {
        const res = await removeSavedAction(id);
        if (res.ok) router.refresh();
        else setFailed(true);
      } catch {
        setFailed(true);
      }
    });
  };

  return (
    <button
      type="button"
      className={`${s.heart} ${failed ? s.heartFail : ""}`}
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      title={failed ? failedLabel : label}
    >
      <Heart size={17} fill="currentColor" />
    </button>
  );
}