import { getUiText } from "@/i18n/server-ui-text";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { patientApi } from "@/lib/auth/session";
import { uuid } from "@/lib/api/zuwara/care";
import {
  validateAppointment,
  type AppointmentResource,
} from "@/lib/api/zuwara/appointments";
import { CareLayout, Facts, currency, s } from "../../../_care/ui";
export default async function GroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uiText = await getUiText();
  const { id } = await params,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const { data } = await patientApi<{
    session_group_id: string;
    sessions: AppointmentResource[];
  }>("/therapy-bookings/" + uuid(id));
  if (data.session_group_id !== id || !Array.isArray(data.sessions))
    throw new Error(uiText("Invalid package."));
  data.sessions.forEach(validateAppointment);
  return (
    <CareLayout title={uiText("Therapy package")}>
      <section className={s.card}>
        <Facts
          rows={[
            [uiText("Group reference"), data.session_group_id],
            [uiText("Sessions"), data.sessions.length],
          ]}
        />
      </section>
      <div className={s.grid}>
        {data.sessions.map((session) => (
          <article className={s.card} key={session.id}>
            <h2>{session.appointment_number}</h2>
            <Facts
              rows={[
                [uiText("Status"), session.status.key],
                [uiText("Date"), session.scheduled.date],
                [uiText("Time"), session.scheduled.time],
                [uiText("End time"), session.scheduled.end_time],
                [uiText("Duration"), session.scheduled.duration_minutes],
                [
                  uiText("Consultant"),
                  ar
                    ? session.doctor?.name_ar || session.doctor?.name
                    : session.doctor?.name,
                ],
                [uiText("Consultation type"), session.consultation_type],
                [
                  uiText("Payable"),
                  currency(
                    session.amount.payable_halalas,
                    session.amount.currency,
                    ar,
                  ),
                ],
                [uiText("Notes"), session.problem],
              ]}
            />
            <Link href={prefix + "/dashboard/appointments/" + session.id}>
              {uiText("Appointment details")}{" "}</Link>
            {session.status.code === 7 ? (
              <p>
                <Link
                  className={s.button}
                  href={
                    prefix + "/dashboard/appointments/" + session.id + "/pay"
                  }
                >
                  {uiText("Continue package payment")}{" "}</Link>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </CareLayout>
  );
}
