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
  const { id } = await params,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const { data } = await patientApi<{
    session_group_id: string;
    sessions: AppointmentResource[];
  }>("/therapy-bookings/" + uuid(id));
  if (data.session_group_id !== id || !Array.isArray(data.sessions))
    throw new Error("Invalid package.");
  data.sessions.forEach(validateAppointment);
  return (
    <CareLayout title="Therapy package">
      <section className={s.card}>
        <Facts
          rows={[
            ["Group reference", data.session_group_id],
            ["Sessions", data.sessions.length],
          ]}
        />
      </section>
      <div className={s.grid}>
        {data.sessions.map((session) => (
          <article className={s.card} key={session.id}>
            <h2>{session.appointment_number}</h2>
            <Facts
              rows={[
                ["Status", session.status.key],
                ["Date", session.scheduled.date],
                ["Time", session.scheduled.time],
                ["End time", session.scheduled.end_time],
                ["Duration", session.scheduled.duration_minutes],
                [
                  "Consultant",
                  ar
                    ? session.doctor?.name_ar || session.doctor?.name
                    : session.doctor?.name,
                ],
                ["Consultation type", session.consultation_type],
                [
                  "Payable",
                  currency(
                    session.amount.payable_halalas,
                    session.amount.currency,
                    ar,
                  ),
                ],
                ["Notes", session.problem],
              ]}
            />
            <Link href={prefix + "/dashboard/appointments/" + session.id}>
              Appointment details
            </Link>
            {session.status.code === 7 ? (
              <p>
                <Link
                  className={s.button}
                  href={
                    prefix + "/dashboard/appointments/" + session.id + "/pay"
                  }
                >
                  Continue package payment
                </Link>
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </CareLayout>
  );
}
