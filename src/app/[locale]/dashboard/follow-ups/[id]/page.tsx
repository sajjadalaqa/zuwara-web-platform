import { getUiText } from "@/i18n/server-ui-text";
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
  const uiText = await getUiText();
  const { id } = await params,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    item = await followUpDetails(id);
  const query = "?follow_up_id=" + encodeURIComponent(item.id);
  return (
    <FollowUpLayout ar={ar} detail><Link className={s.back} href={prefix+"/dashboard/follow-ups"}><ArrowLeft size={15}/>{uiText("Back to follow-ups")}</Link><div className={s.detailGrid}>
      <section className={s.detailPanel}><h2 className={s.detailTitle}><CalendarClock size={20}/>{uiText("Session information")}</h2>
        <Facts
          rows={[
            [uiText("Reference"), item.id],
            [uiText("Appointment"), item.appointment_id],
            [uiText("Workflow"), item.workflow],
            [uiText("Status"), ar ? item.status_label_ar : item.status_label],
            [uiText("Scheduled"), stamp(item.scheduled_at, ar)],
            [uiText("Access ends"), stamp(item.available_until, ar)],
            ["Duration (minutes)", item.duration_minutes],
            [uiText("Completed"), stamp(item.completed_at, ar)],
            [uiText("Closed"), stamp(item.closed_at, ar)],
            [uiText("Close reason"), item.close_reason],
            [uiText("Notes"), item.notes],
            [uiText("Summary changed"), item.summary_changed],
            [uiText("Can join"), item.can_join],
          ]}
        />
</section><aside className={s.detailPanel}><h2 className={s.detailTitle}>{uiText("Your appointment")}</h2>        <div className={s.actions}>
          <Link
            href={prefix + "/dashboard/appointments/" + item.appointment_id}
          >
            {uiText("Original appointment")}{" "}<ArrowUpRight size={16}/>
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
            {uiText("Conversation")}{" "}<MessageCircle size={16}/>
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
              {uiText("Join follow-up")}{" "}<Video size={16}/>
            </Link>
          ) : null}
        </div>
        <p className={s.notice}><Info size={16}/>
          {uiText("Scheduling, reopening and clinical completion are managed by your consultant.")}{" "}</p>
      </aside></div><div className={s.summaries}>
      <Clinical
        title={uiText("Current clinical summary")}
        data={item.effective_summary}
      />
      <Clinical title={uiText("Original summary")} data={item.original_summary} />
      {item.follow_up_summary ? (
        <Clinical title={uiText("Follow-up summary")} data={item.follow_up_summary} />
      ) : null}
      </div></FollowUpLayout>
  );
}
