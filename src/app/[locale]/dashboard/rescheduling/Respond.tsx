"use client";
import { useUiText } from "@/i18n/use-ui-text";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { respondRescheduleAction } from "../_care/commands";
import s from "../_care/care.module.css";
export default function Respond({ id }: { id: string }) {
  const uiText = useUiText();
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
          uiText("Response was not confirmed. Refresh to check the current status before retrying."),
        );
      }
    });
  }
  return (
    <div className={s.form}>
      <p>{uiText("Respond to your consultant?s proposed therapy time.")}</p>
      <label>
        {uiText("Reason if declining")}{" "}<textarea
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
          {uiText("Approve proposed time")}{" "}</button>
        <button
          className={s.button}
          disabled={pending || !reason.trim()}
          onClick={() => respond("reject")}
        >
          {uiText("Reject")}{" "}</button>
      </div>
      {error ? <p className={s.error}>{uiText(error)}</p> : null}
    </div>
  );
}
