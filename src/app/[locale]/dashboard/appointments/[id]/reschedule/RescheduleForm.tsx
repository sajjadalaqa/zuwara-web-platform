"use client";
import { useUiText } from "@/i18n/use-ui-text";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  previewRescheduleAction,
  rescheduleSlotsAction,
  prepareCareAction,
  submitCareAction,
  type CareQuote,
  type PendingIntent,
} from "../../../_care/commands";
import s from "../../../_care/care.module.css";
export default function RescheduleForm({
  id,
  doctor,
  plan,
  duration: initialDuration,
  pending,
}: {
  id: string;
  doctor: number;
  plan: number | null;
  duration: number;
  pending: PendingIntent | null;
}) {
  const uiText = useUiText();
  const router = useRouter(),
    ar = useLocale() === "ar",
    prefix = ar ? "/ar" : "",
    today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const [date, setDate] = useState(today),
    [duration, setDuration] = useState(initialDuration),
    [time, setTime] = useState(""),
    [reason, setReason] = useState(""),
    [method, setMethod] = useState<"wallet" | "myfatoorah" | "tamara">(
      "wallet",
    ),
    [slots, setSlots] = useState<string[]>([]),
    [quote, setQuote] = useState<CareQuote | null>(null),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(Boolean(pending)),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const [resume, setResume] = useState(pending);
  const locked = busy || uncertain,
    token = quote?.token || resume?.token;
  useEffect(() => {
    let active = true;
    rescheduleSlotsAction(Number(id), doctor, plan, duration, date)
      .then((result) => {
        if (!active) return;
        setSlots(result.ok ? result.slots : []);
        if (!result.ok) setError(uiText("Availability could not be loaded."));
      })
      .catch(() => {
        if (active) {
          setSlots([]);
          setError(uiText("Availability could not be loaded."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, doctor, plan, duration, date]);
  async function preview() {
    setBusy(true);
    setError("");
    try {
      const result = await previewRescheduleAction({
        appointment_id: Number(id),
        date,
        time,
        duration_minutes: duration,
        reason,
        payment_method: method,
      });
      if (result.ok) setQuote(result.quote);
      else setError("Preview rejected: " + result.error);
    } catch {
      setError(uiText("Preview could not be loaded."));
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const prepared = await prepareCareAction("reschedule:" + id, token);
      if (!prepared.ok) {
        setError("Request preparation failed: " + prepared.error);
        return;
      }
      const result = await submitCareAction("reschedule:" + id, token);
      if (!result.ok) {
        setUncertain(result.uncertain);
        if (!result.uncertain) {
          setQuote(null);
          setResume(null);
        }
        setError("Request not confirmed: " + result.error);
        return;
      }
      if ("checkout" in result && result.checkout) {
        router.push("/dashboard/checkouts/" + result.checkout);
        return;
      }
      router.push("/dashboard/rescheduling?appointment_id=" + id);
      router.refresh();
    } catch {
      setUncertain(true);
      setError(
        uiText("Outcome unknown. Retry the same request; do not start a second payment."),
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.form}>
      {resume ? (
        <p className={s.notice}>
          {uiText("An earlier request is pending confirmation. Resume it using the same intent.")}{" "}{resume!.checkoutId ? (
            <Link href={prefix + "/dashboard/checkouts/" + resume!.checkoutId}>
              {" "}
              {uiText("Open existing payment")}{" "}</Link>
          ) : null}
        </p>
      ) : null}
      <label>
        {uiText("New date")}{" "}<input
          type="date"
          min={today}
          value={date}
          disabled={locked}
          onChange={(e) => {
            setLoading(true);
            setDate(e.target.value);
            setTime("");
            setQuote(null);
          }}
        />
      </label>
      <label>
        {uiText("Duration")}{" "}<select
          value={duration}
          disabled={locked || Boolean(plan)}
          onChange={(e) => {
            setLoading(true);
            setDuration(Number(e.target.value));
            setTime("");
            setQuote(null);
          }}
        >
          {[15, 30, 45, 60].map((n) => (
            <option key={n} value={n}>
              {n} {uiText("minutes")}{" "}</option>
          ))}
        </select>
      </label>
      {loading ? (
        <p>{uiText("Loading times?")}</p>
      ) : (
        <div className={s.slots}>
          {slots.map((value) => (
            <button
              key={value}
              type="button"
              disabled={locked}
              className={s.slot + (time === value ? " " + s.selected : "")}
              onClick={() => {
                setTime(value);
                setQuote(null);
              }}
            >
              {value}
            </button>
          ))}
          {!slots.length ? <p>{uiText("No available times returned.")}</p> : null}
        </div>
      )}
      <label>
        {uiText("Reason (up to 500 characters)")}{" "}<textarea
          maxLength={500}
          value={reason}
          disabled={locked}
          onChange={(e) => {
            setReason(e.target.value);
            setQuote(null);
          }}
        />
      </label>
      <label>
        {uiText("Payment if an upgrade is required")}{" "}<select
          disabled={locked}
          value={method}
          onChange={(e) => {
            setMethod(e.target.value as typeof method);
            setQuote(null);
          }}
        >
          <option value="wallet">{uiText("Wallet")}</option>
          {!plan ? (
            <>
              <option value="myfatoorah">MyFatoorah</option>
              <option value="tamara">Tamara</option>
            </>
          ) : null}
        </select>
      </label>
      <button
        className={s.button}
        disabled={locked || !time || !reason.trim()}
        onClick={preview}
      >
        {uiText("Preview change and charge")}{" "}</button>
      {quote ? (
        <p className={s.notice}>
          {uiText("Additional charge:")}{" "}{(quote.payable / 100).toFixed(2)} {quote.currency}
          {uiText(". No slot is reserved by this preview.")}{" "}</p>
      ) : null}
      {token ? (
        <button className={s.button} disabled={busy} onClick={submit}>
          {uncertain
            ? "Resume original request"
            : "Confirm reschedule request and any required payment"}
        </button>
      ) : null}
      {error ? (
        <p className={s.error} role="alert">
          {uiText(error)}
        </p>
      ) : null}
    </div>
  );
}
