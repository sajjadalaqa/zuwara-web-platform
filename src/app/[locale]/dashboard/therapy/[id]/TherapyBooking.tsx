"use client";
import { useUiText } from "@/i18n/use-ui-text";
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
import base from "../../_care/care.module.css";
import detail from "./detail.module.css";
import {CalendarDays, Video} from "lucide-react";
const s={...base,...detail};
function displayTime(value: string) {
  const match = /^(\d{2}):?(\d{2})(?::\d{2})?$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) return value;
  const hour = Number(match[1]);
  return String(hour % 12 || 12).padStart(2, "0") + ":" + match[2] + (hour >= 12 ? " PM" : " AM");
}
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
  const uiText = useUiText();
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
  const [activeDate, setActiveDate] = useState<string | null>(null);
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
          setError(uiText("Therapy availability could not be loaded."));
        }
      })
      .catch(() => {
        if (active) {
          setCalendar([]);
          setError(uiText("Therapy availability could not be loaded."));
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [plan.id, doctor, duration, date, uiText]);
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
      setError(uiText("The price preview could not be loaded."));
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
        uiText("Outcome unknown. Retry this request or check appointment history before starting a new package."),
      );
    } finally {
      setBusy(false);
    }
  }
  if (resume && resume!.resourceId !== String(plan.id))
    return (
      <section className={s.card}>
        <p>{uiText("Resolve your earlier therapy request first.")}</p>
        <Link
          href={(ar ? "/ar" : "") + "/dashboard/therapy/" + resume!.resourceId}
        >
          {uiText("Resume request")}{" "}</Link>
      </section>
    );
  return (
    <section className={s.card} id="therapy-booking">
      <div className={s.sectionHeading}><div><span className={s.eyebrow}>{ar?"\u062e\u0637\u0648\u062a\u0643 \u0627\u0644\u062a\u0627\u0644\u064a\u0629":"YOUR NEXT STEP"}</span><h2><CalendarDays size={22}/>{uiText("Book therapy sessions")}</h2></div><span className={s.softLabel}><Video size={15}/>{ar?"\u0639\u0646 \u0628\u064f\u0639\u062f":"Online"}</span></div>
      {resume ? (
        <p className={s.notice}>
          {uiText("An earlier request has an unconfirmed outcome. Retry it with the original selections before starting another package.")}{" "}</p>
      ) : null}
      <div className={s.form}>
        <label>
          {uiText("Consultant")}{" "}<select
            disabled={locked}
            value={doctor}
            onChange={(e) => {
              setLoading(true);
              setActiveDate(null);
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
          {uiText("Duration")}{" "}<select
            disabled={locked}
            value={duration}
            onChange={(e) => {
              setLoading(true);
              setActiveDate(null);
              setDuration(Number(e.target.value));
              setSessions([]);
              setQuote(null);
            }}
          >
            {plan.durations?.map((d) => (
              <option key={d.duration_minutes} value={d.duration_minutes}>
                {d.duration_minutes} {uiText("minutes")}{" "}</option>
            ))}
          </select>
        </label>
        <label>
          {uiText("Week starting")}{" "}<input
            type="date"
            min={today}
            value={date}
            disabled={locked}
            onChange={(e) => {
              setLoading(true);
              setActiveDate(null);
              setDate(e.target.value);
            }}
          />
        </label>
        {loading ? (
          <p role="status" className={s.loading}>{ar?"\u062c\u0627\u0631\u064d \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064a\u062f...":"Finding available sessions..."}</p>
        ) : (
          <div className={s.schedule}>
          <div className={s.dateChoices} role="group" aria-label={ar?"\u0627\u062e\u062a\u0631 \u0627\u0644\u062a\u0627\u0631\u064a\u062e":"Choose a date"}>
            {calendar.map(day=>{const stamp=new Date(day.date+"T12:00:00Z"),locale=ar?"ar-SA-u-ca-gregory":"en-GB";return <button type="button" key={day.date} disabled={locked||!day.is_available||!day.slots.length} aria-pressed={activeDate===day.date} onClick={()=>setActiveDate(day.date)}><small>{new Intl.DateTimeFormat(locale,{weekday:"short",timeZone:"UTC"}).format(stamp)}</small><strong>{new Intl.DateTimeFormat(locale,{day:"2-digit",timeZone:"UTC"}).format(stamp)}</strong><span>{new Intl.DateTimeFormat(locale,{month:"short",timeZone:"UTC"}).format(stamp)}</span></button>;})}
          </div>
          {!calendar.length?<p className={s.muted}>{uiText("No available slots.")}</p>:!activeDate?<p className={s.dateHint}>{ar?"\u0627\u062e\u062a\u0631 \u062a\u0627\u0631\u064a\u062e\u064b\u0627 \u0644\u0639\u0631\u0636 \u0627\u0644\u0623\u0648\u0642\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u062d\u0629":"Select a date to see available times."}</p>:null}
          {calendar.filter(day=>day.date===activeDate).map((day) => (
            <div className={s.calendarDay} key={day.date}>
              <h3>{day.date}</h3>
              <div className={s.slots}>
                {day.is_available && day.slots.length ? (
                  day.slots.map((slot) => (
                    <button
                      type="button"
                      key={slot.start_time}
                      aria-pressed={sessions.some(x=>x.date===day.date&&x.time===slot.start_time)}
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
                      <bdi>{displayTime(slot.start_time)}{" \u2013 "}{displayTime(slot.end_time)}</bdi>
                    </button>
                  ))
                ) : (
                  <p className={s.muted}>{uiText("No available slots.")}</p>
                )}
              </div>
            </div>
          ))}
          </div>
        )}
        <p>
          {sessions.length} {uiText("selected")}{" "}{plan.total_sessions ? " / " + Math.min(plan.total_sessions, 20) : ""}
        </p>
        {sessions.map((item) => (
          <p key={item.date + item.time}>
            {item.date}{" \u00b7 "}<bdi>{displayTime(item.time)}</bdi>{" "}
            {!locked ? (
              <button
                type="button"
                onClick={() => choose(item.date, item.time)}
              >
                {uiText("Remove")}{" "}</button>
            ) : null}
          </p>
        ))}
        <label>
          {uiText("Patient")}{" "}<select
            disabled={locked}
            value={patient ?? ""}
            onChange={(e) => {
              setPatient(e.target.value ? Number(e.target.value) : null);
              setQuote(null);
            }}
          >
            <option value="">{uiText("Myself")}</option>
            {dependents.map((id) => (
              <option key={id} value={id}>
                {uiText("Saved patient #")}{id}
              </option>
            ))}
          </select>
        </label>
        <p>{uiText("Consultation type: Online")}</p>
        <label>
          {uiText("Notes (up to 500 characters)")}{" "}<textarea
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
          {uiText("Payment")}{" "}<select
            disabled={locked}
            value={method}
            onChange={(e) => {
              setMethod(e.target.value as typeof method);
              setQuote(null);
            }}
          >
            <option value="wallet">{uiText("Wallet")}</option>
            <option value="myfatoorah">MyFatoorah</option>
            <option value="tamara">Tamara</option>
          </select>
        </label>
        <button
          className={s.button}
          disabled={locked || !doctor || !sessions.length || !problem.trim()}
          onClick={preview}
        >
          {uiText("Preview package price")}{" "}</button>
      </div>
      {quote ? (
        <div className={s.notice}>
          <p>
            {uiText("Service:")}{" "}{(quote.service / 100).toFixed(2)} {quote.currency}
          </p>
          <p>
            {uiText("Tax:")}{" "}{(quote.tax / 100).toFixed(2)} {quote.currency}
          </p>
          <p>
            {uiText("Total:")}{" "}{(quote.payable / 100).toFixed(2)} {quote.currency}
          </p>
          {quote.sessions?.map((item) => (
            <p key={item.session_number}>
              {uiText("Session")}{" "}{item.session_number}: {item.date} <bdi>{displayTime(item.time)}{" \u2013 "}
              {displayTime(item.end_time)}</bdi>
            </p>
          ))}
          <p>{uiText("Slots are not reserved by this preview.")}</p>
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
          {uiText(error)}
        </p>
      ) : null}
    </section>
  );
}
