"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { payHomeAction } from "@/app/[locale]/provider/[id]/book/booking-api";
import s from "../../_care/care.module.css";
export default function PayVisit({ group }: { group: string }) {
  const [pending, start] = useTransition(),
    [message, setMessage] = useState(""),
    router = useRouter();
  return (
    <div className={s.actions}>
      <button
        className={s.button}
        disabled={pending}
        onClick={() =>
          start(async () => {
            try {
              const result = await payHomeAction(group);
              setMessage(
                result.ok && result.paid
                  ? "Payment verified."
                  : "Payment is not confirmed. Retry this same group; do not create another booking.",
              );
              if (result.ok && result.paid) router.refresh();
            } catch {
              setMessage(
                "Payment outcome is unknown. Check your wallet and retry this same group.",
              );
            }
          })
        }
      >
        Pay from shared wallet / retry verification
      </button>
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
