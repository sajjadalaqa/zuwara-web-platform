import Link from "next/link";
import { getLocale } from "next-intl/server";
import { patientApi } from "@/lib/auth/session";
import { reviewWorkflow, dateValue } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, stamp, s } from "../../../_care/ui";
export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { id } = await params,
    sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    data = await reviewWorkflow(id);
  let slots: null | { start_time: string; end_time?: string }[] = null,
    slotError = false;
  if (sp.date && data.follow_up.eligible) {
    try {
      const result = await patientApi<{
        slots: { start_time: string; end_time?: string }[];
      }>("/appointments/" + id + "/follow-up/slots?date=" + dateValue(sp.date));
      slots = Array.isArray(result.data.slots) ? result.data.slots : null;
      if (!slots) slotError = true;
    } catch {
      slotError = true;
    }
  }
  return (
    <CareLayout title="Follow-up and reopen status">
      <section className={s.card}>
        <h2>Follow-up</h2>
        <Facts
          rows={[
            ["Eligible for consultant scheduling", data.follow_up.eligible],
            ["Reason", data.follow_up.reason],
            ["Completed", stamp(data.follow_up.completed_at, ar)],
            ["Schedule by", stamp(data.follow_up.schedule_by, ar)],
            ["Duration (minutes)", data.follow_up.duration_minutes],
            ["Patient can schedule", data.patient_can_schedule_follow_up],
            ["Patient can complete", data.patient_can_complete_review],
          ]}
        />
        {data.follow_up.follow_up?.id ? (
          <Link
            href={
              prefix + "/dashboard/follow-ups/" + data.follow_up.follow_up.id
            }
          >
            Open scheduled follow-up
          </Link>
        ) : null}
        <p className={s.notice}>
          Your consultant manages follow-up scheduling and clinical completion.
        </p>
        {data.follow_up.eligible ? (
          <form className={s.form}>
            <label>
              Check follow-up availability
              <input type="date" name="date" required defaultValue={sp.date} />
            </label>
            <button className={s.button}>View times</button>
          </form>
        ) : null}
        {slotError ? (
          <p className={s.error}>
            Follow-up availability could not be loaded for this date.
          </p>
        ) : slots ? (
          <div className={s.slots}>
            {slots.length
              ? slots.map((slot) => (
                  <span key={slot.start_time} className={s.slot}>
                    {slot.start_time}
                    {slot.end_time ? " - " + slot.end_time : ""}
                  </span>
                ))
              : "No slots returned."}
          </div>
        ) : null}
      </section>
      <section className={s.card}>
        <h2>Reopen status</h2>
        <Facts
          rows={[
            ["Consultant eligible", data.reopen.eligible_for_consultant],
            ["Used", data.reopen.used],
            ["Completed", data.reopen.completed],
            ["Active", data.reopen.active],
            ["Ends", stamp(data.reopen.ends_at, ar)],
            ["Patient can reopen", data.patient_can_reopen],
          ]}
        />
      </section>
    </CareLayout>
  );
}
