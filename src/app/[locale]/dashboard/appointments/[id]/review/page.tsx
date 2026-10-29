import { getUiText } from "@/i18n/server-ui-text";
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
  const uiText = await getUiText();
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
    <CareLayout title={uiText("Follow-up and reopen status")}>
      <section className={s.card}>
        <h2>{uiText("Follow-up")}</h2>
        <Facts
          rows={[
            [uiText("Eligible for consultant scheduling"), data.follow_up.eligible],
            [uiText("Reason"), data.follow_up.reason],
            [uiText("Completed"), stamp(data.follow_up.completed_at, ar)],
            [uiText("Schedule by"), stamp(data.follow_up.schedule_by, ar)],
            ["Duration (minutes)", data.follow_up.duration_minutes],
            [uiText("Patient can schedule"), data.patient_can_schedule_follow_up],
            [uiText("Patient can complete"), data.patient_can_complete_review],
          ]}
        />
        {data.follow_up.follow_up?.id ? (
          <Link
            href={
              prefix + "/dashboard/follow-ups/" + data.follow_up.follow_up.id
            }
          >
            {uiText("Open scheduled follow-up")}{" "}</Link>
        ) : null}
        <p className={s.notice}>
          {uiText("Your consultant manages follow-up scheduling and clinical completion.")}{" "}</p>
        {data.follow_up.eligible ? (
          <form className={s.form}>
            <label>
              {uiText("Check follow-up availability")}{" "}<input type="date" name="date" required defaultValue={sp.date} />
            </label>
            <button className={s.button}>{uiText("View times")}</button>
          </form>
        ) : null}
        {slotError ? (
          <p className={s.error}>
            {uiText("Follow-up availability could not be loaded for this date.")}{" "}</p>
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
        <h2>{uiText("Reopen status")}</h2>
        <Facts
          rows={[
            [uiText("Consultant eligible"), data.reopen.eligible_for_consultant],
            [uiText("Used"), data.reopen.used],
            [uiText("Completed"), data.reopen.completed],
            [uiText("Active"), data.reopen.active],
            [uiText("Ends"), stamp(data.reopen.ends_at, ar)],
            [uiText("Patient can reopen"), data.patient_can_reopen],
          ]}
        />
      </section>
    </CareLayout>
  );
}
