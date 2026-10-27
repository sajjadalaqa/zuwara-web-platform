"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

export default function ScheduleUpdateButton() {
  const { pending } = useFormStatus();
  const [status, setStatus] = useState({ pending: false, updated: false });

  // Track completion of this form's navigation, rather than a button click.
  if (status.pending !== pending) {
    setStatus({ pending, updated: !pending });
  }

  return <>
    <button className="button button-secondary" type="submit" disabled={pending}>
      {pending ? "Updating schedule…" : "Update schedule"}
    </button>
    <p role="status" aria-live="polite" style={{
      gridColumn: "1 / -1", margin: 0, fontSize: 12,
      color: pending ? "#927a9f" : "#378467",
    }}>
      {pending ? "Loading availability…" : status.updated ? "Schedule updated. Availability is shown below." : ""}
    </p>
  </>;
}