import Link from "next/link";
import { getLocale } from "next-intl/server";
import { followUpDetails } from "@/lib/api/zuwara/care";
import { Facts, Clinical, stamp } from "../../_care/ui";
import FollowUpLayout from "../FollowUpLayout";
import s from "../follow-ups.module.css";
import { ArrowLeft, CalendarClock, MessageCircle, Video, ArrowUpRight, Info } from "lucide-react";
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
    <FollowUpLayout ar={ar} detail><Link className={s.back} href={prefix+"/dashboard/follow-ups"}><ArrowLeft size={15}/>Back to follow-ups</Link><div className={s.detailGrid}>
      <section className={s.detailPanel}><h2 className={s.detailTitle}><CalendarClock size={20}/>Session information</h2>
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
</section><aside className={s.detailPanel}><h2 className={s.detailTitle}>Your appointment</h2>        <div className={s.actions}>
          <Link
            href={prefix + "/dashboard/appointments/" + item.appointment_id}
          >
            Original appointment <ArrowUpRight size={16}/>
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
            Conversation <MessageCircle size={16}/>
          </Link>
          {item.can_join ? (
            <Link
              className={s.join}
              href={
                prefix +
                "/dashboard/appointments/" +
                item.appointment_id +
                "/video" +
                query
              }
            >
              Join follow-up <Video size={16}/>
            </Link>
          ) : null}
        </div>
        <p className={s.notice}><Info size={16}/>
          Scheduling, reopening and clinical completion are managed by your
          consultant.
        </p>
      </aside></div><div className={s.summaries}>
      <Clinical
        title="Current clinical summary"
        data={item.effective_summary}
      />
      <Clinical title="Original summary" data={item.original_summary} />
      {item.follow_up_summary ? (
        <Clinical title="Follow-up summary" data={item.follow_up_summary} />
      ) : null}
      </div></FollowUpLayout>
  );
}
