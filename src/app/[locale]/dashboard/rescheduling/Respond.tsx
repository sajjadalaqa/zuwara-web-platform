"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondRescheduleAction } from "../_care/commands";
import s from "../_care/care.module.css";
export default function Respond({ id }: { id: string }) {
  const router = useRouter(),
    [reason, setReason] = useState(""),
    [pending, start] = useTransition(),
    [error, setError] = useState("");
  function respond(decision: "approve" | "reject") {
    start(async () => {
      try {
        const result = await respondRescheduleAction(id, decision, reason);
        if (result.ok) router.refresh();
        else setError("Response not confirmed: " + result.error);
      } catch {
        setError(
          "Response was not confirmed. Refresh to check the current status before retrying.",
        );
      }
    });
  }
  return (
    <div className={s.form}>
      <p>Respond to your consultant?s proposed therapy time.</p>
      <label>
        Reason if declining
        <textarea
          value={reason}
          maxLength={4000}
          onChange={(e) => setReason(e.target.value)}
        />
      </label>
      <div className={s.actions}>
        <button
          className={s.button}
          disabled={pending}
          onClick={() => respond("approve")}
        >
          Approve proposed time
        </button>
        <button
          className={s.button}
          disabled={pending || !reason.trim()}
          onClick={() => respond("reject")}
        >
          Reject
        </button>
      </div>
      {error ? <p className={s.error}>{error}</p> : null}
    </div>
  );
}
