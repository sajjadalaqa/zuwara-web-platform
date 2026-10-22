import Link from "next/link";
import { getLocale } from "next-intl/server";
import { followUpDetails } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, Clinical, stamp, s } from "../../_care/ui";
export default async function FollowUpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    item = await followUpDetails(id);
  const query = "?follow_up_id=" + encodeURIComponent(item.id);
  return (
    <CareLayout title="Follow-up details">
      <section className={s.card}>
        <Facts
          rows={[
            ["Reference", item.id],
            ["Appointment", item.appointment_id],
            ["Workflow", item.workflow],
            ["Status", ar ? item.status_label_ar : item.status_label],
            ["Scheduled", stamp(item.scheduled_at, ar)],
            ["Access ends", stamp(item.available_until, ar)],
            ["Duration (minutes)", item.duration_minutes],
            ["Completed", stamp(item.completed_at, ar)],
            ["Closed", stamp(item.closed_at, ar)],
            ["Close reason", item.close_reason],
            ["Notes", item.notes],
            ["Summary changed", item.summary_changed],
            ["Can join", item.can_join],
          ]}
        />
        <div className={s.actions}>
          <Link
            href={prefix + "/dashboard/appointments/" + item.appointment_id}
          >
            Original appointment
          </Link>
          <Link
            href={
              prefix +
              "/dashboard/appointments/" +
              item.appointment_id +
              "/chat" +
              query
            }
          >
            Conversation
          </Link>
          {item.can_join ? (
            <Link
              className={s.button}
              href={
                prefix +
                "/dashboard/appointments/" +
                item.appointment_id +
                "/video" +
                query
              }
            >
              Join follow-up
            </Link>
          ) : null}
        </div>
        <p className={s.notice}>
          Scheduling, reopening and clinical completion are managed by your
          consultant.
        </p>
      </section>
      <Clinical
        title="Current clinical summary"
        data={item.effective_summary}
      />
      <Clinical title="Original summary" data={item.original_summary} />
      {item.follow_up_summary ? (
        <Clinical title="Follow-up summary" data={item.follow_up_summary} />
      ) : null}
    </CareLayout>
  );
}
