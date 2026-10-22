"use client";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";
import type { Plan, PlanDoctor } from "@/lib/api/zuwara/care";
import {
  therapySlotsAction,
  previewTherapyAction,
  prepareCareAction,
  submitCareAction,
  type CareQuote,
  type PendingIntent,
} from "../../_care/commands";
import s from "../../_care/care.module.css";
export default function TherapyBooking({
  plan,
  doctors,
  pending,
  dependents,
}: {
  plan: Plan;
  doctors: PlanDoctor[];
  pending: PendingIntent | null;
  dependents: number[];
}) {
  const ar = useLocale() === "ar",
    router = useRouter(),
    today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Riyadh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const [doctor, setDoctor] = useState(doctors[0]?.id || 0),
    [duration, setDuration] = useState(
      plan.durations?.[0]?.duration_minutes || 30,
    ),
    [date, setDate] = useState(today),
    [sessions, setSessions] = useState<{ date: string; time: string }[]>([]),
    [calendar, setCalendar] = useState<
      {
        date: string;
        is_available: boolean;
        slots: { start_time: string; end_time: string }[];
      }[]
    >([]),
    [loading, setLoading] = useState(Boolean(doctors.length));
  const [problem, setProblem] = useState(""),
    [method, setMethod] = useState<"wallet" | "myfatoorah" | "tamara">(
      "wallet",
    ),
    [quote, setQuote] = useState<CareQuote | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [uncertain, setUncertain] = useState(Boolean(pending));
  const [patient, setPatient] = useState<number | null>(null);
  const [resume, setResume] = useState(pending);
  const token = quote?.token || resume?.token,
    locked = busy || uncertain;
  useEffect(() => {
    let active = true;
    if (!doctor) return;
    therapySlotsAction(String(plan.id), String(doctor), duration, date)
      .then((result) => {
        if (!active) return;
        if (result.ok) {
          setCalendar(result.calendar.dates);
          setError("");
        } else {
          setCalendar([]);
          setError("Therapy availability could not be loaded.");
        }
      })
      .catch(() => {
        if (active) {
          setCalendar([]);
          setError("Therapy availability could not be loaded.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [plan.id, doctor, duration, date]);
  function choose(day: string, time: string) {
    setQuote(null);
    setSessions((previous) => {
      const exists = previous.some((s) => s.date === day && s.time === time);
      return exists
        ? previous.filter((s) => !(s.date === day && s.time === time))
        : [...previous, { date: day, time }].sort((a, b) =>
            (a.date + a.time).localeCompare(b.date + b.time),
          );
    });
  }
  async function preview() {
    setBusy(true);
    setError("");
    try {
      const result = await previewTherapyAction({
        therapy_plan_id: plan.id,
        doctor_id: doctor,
        patient_id: patient,
        duration_minutes: duration,
        consultation_type: "online",
        problem,
        payment_method: method,
        sessions,
      });
      if (result.ok) setQuote(result.quote);
      else setError("Preview failed: " + result.error);
    } catch {
      setError("The price preview could not be loaded.");
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!token) return;
    setBusy(true);
    setError("");
    try {
      const prepared = await prepareCareAction("therapy", token);
      if (!prepared.ok) {
        setError("Request preparation failed: " + prepared.error);
        return;
      }
      const result = await submitCareAction("therapy", token);
      if (!result.ok) {
        setUncertain(result.uncertain);
        if (!result.uncertain) {
          setQuote(null);
          setResume(null);
        }
        setError("Booking not confirmed: " + result.error);
        return;
      }
      if ("group" in result && result.group)
        router.push("/dashboard/therapy/groups/" + result.group);
      router.refresh();
    } catch {
      setUncertain(true);
      setError(
        "Outcome unknown. Retry this request or check appointment history before starting a new package.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (resume && resume!.resourceId !== String(plan.id))
    return (
      <section className={s.card}>
        <p>Resolve your earlier therapy request first.</p>
        <Link
          href={(ar ? "/ar" : "") + "/dashboard/therapy/" + resume!.resourceId}
        >
          Resume request
        </Link>
      </section>
    );
  return (
    <section className={s.card}>
      <h2>Book therapy sessions</h2>
      {resume ? (
        <p className={s.notice}>
          An earlier request has an unconfirmed outcome. Retry it with the
          original selections before starting another package.
        </p>
      ) : null}
      <div className={s.form}>
        <label>
          Consultant
          <select
            disabled={locked}
            value={doctor}
            onChange={(e) => {
              setLoading(true);
              setDoctor(Number(e.target.value));
              setSessions([]);
              setQuote(null);
            }}
          >
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name[ar ? "ar" : "en"] || d.name.en || d.name.ar}
              </option>
            ))}
          </select>
        </label>
        <label>
          Duration
          <select
            disabled={locked}
            value={duration}
            onChange={(e) => {
              setLoading(true);
              setDuration(Number(e.target.value));
              setSessions([]);
              setQuote(null);
            }}
          >
            {plan.durations?.map((d) => (
              <option key={d.duration_minutes} value={d.duration_minutes}>
                {d.duration_minutes} minutes
              </option>
            ))}
          </select>
        </label>
        <label>
          Week starting
          <input
            type="date"
            min={today}
            value={date}
            disabled={locked}
            onChange={(e) => {
              setLoading(true);
              setDate(e.target.value);
            }}
          />
        </label>
        {loading ? (
          <p>Loading availability?</p>
        ) : (
          calendar.map((day) => (
            <div key={day.date}>
              <h3>{day.date}</h3>
              <div className={s.slots}>
                {day.is_available && day.slots.length ? (
                  day.slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.start_time}
                      disabled={
                        locked ||
                        (sessions.length >=
                          Math.min(plan.total_sessions || 20, 20) &&
                          !sessions.some(
                            (x) =>
                              x.date === day.date && x.time === slot.start_time,
                          ))
                      }
                      className={
                        s.slot +
                        (sessions.some(
                          (x) =>
                            x.date === day.date && x.time === slot.start_time,
                        )
                          ? " " + s.selected
                          : "")
                      }
                      onClick={() => choose(day.date, slot.start_time)}
                    >
                      {slot.start_time}?{slot.end_time}
                    </button>
                  ))
                ) : (
                  <p className={s.muted}>No available slots.</p>
                )}
              </div>
            </div>
          ))
        )}
        <p>
          {sessions.length} selected
          {plan.total_sessions ? " / " + Math.min(plan.total_sessions, 20) : ""}
        </p>
        {sessions.map((item) => (
          <p key={item.date + item.time}>
            {item.date} ? {item.time}{" "}
            {!locked ? (
              <button
                type="button"
                onClick={() => choose(item.date, item.time)}
              >
                Remove
              </button>
            ) : null}
          </p>
        ))}
        <label>
          Patient
          <select
            disabled={locked}
            value={patient ?? ""}
            onChange={(e) => {
              setPatient(e.target.value ? Number(e.target.value) : null);
              setQuote(null);
            }}
          >
            <option value="">Myself</option>
            {dependents.map((id) => (
              <option key={id} value={id}>
                Saved patient #{id}
              </option>
            ))}
          </select>
        </label>
        <p>Consultation type: Online</p>
        <label>
          Notes (up to 500 characters)
          <textarea
            maxLength={500}
            disabled={locked}
            value={problem}
            onChange={(e) => {
              setProblem(e.target.value);
              setQuote(null);
            }}
          />
        </label>
        <label>
          Payment
          <select
            disabled={locked}
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as typeof method);
              setQuote(null);
            }}
          >
            <option value="wallet">Wallet</option>
            <option value="myfatoorah">MyFatoorah</option>
            <option value="tamara">Tamara</option>
          </select>
        </label>
        <button
          className={s.button}
          disabled={locked || !doctor || !sessions.length || !problem.trim()}
          onClick={preview}
        >
          Preview package price
        </button>
      </div>
      {quote ? (
        <div className={s.notice}>
          <p>
            Service: {(quote.service / 100).toFixed(2)} {quote.currency}
          </p>
          <p>
            Tax: {(quote.tax / 100).toFixed(2)} {quote.currency}
          </p>
          <p>
            Total: {(quote.payable / 100).toFixed(2)} {quote.currency}
          </p>
          {quote.sessions?.map((item) => (
            <p key={item.session_number}>
              Session {item.session_number}: {item.date} {item.time}?
              {item.end_time}
            </p>
          ))}
          <p>Slots are not reserved by this preview.</p>
        </div>
      ) : null}
      {token ? (
        <button className={s.button} disabled={busy} onClick={submit}>
          {uncertain
            ? "Retry original booking"
            : "Confirm package booking and payment"}
        </button>
      ) : null}
      {error ? (
        <p className={s.error} role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
