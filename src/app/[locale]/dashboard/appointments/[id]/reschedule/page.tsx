import { getUiText } from "@/i18n/server-ui-text";
import { patientApi } from "@/lib/auth/session";
import { numericId } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, s } from "../../../_care/ui";
import { pendingCareIntent } from "../../../_care/commands";
import RescheduleForm from "./RescheduleForm";
export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uiText = await getUiText();
  const { id } = await params;
  numericId(id);
  const { data } = await patientApi<{
    id: number;
    kind: string;
    status: { code: number };
    doctor: { id: number } | null;
    scheduled: { date: string; time: string; duration_minutes: number | null };
    therapy: { plan_id: number } | null;
  }>("/appointments/" + id);
  const pending = await pendingCareIntent("reschedule:" + id);
  return (
    <CareLayout title={uiText("Request a different appointment time")}>
      <section className={s.card}>
        <Facts
          rows={[
            [uiText("Appointment"), data.id],
            [uiText("Current date"), data.scheduled.date],
            [uiText("Current time"), data.scheduled.time],
            [uiText("Current duration"), data.scheduled.duration_minutes],
          ]}
        />
        <p className={s.notice}>
          {uiText("The backend checks eligibility and upgrade pricing. A request can require payment and consultant approval. Your appointment stays at its existing time until approval.")}{" "}</p>
        {data.doctor &&
        (pending || data.kind === "therapy"
          ? pending || data.status.code === 1
          : pending || [0, 1].includes(data.status.code)) ? (
          <RescheduleForm
            id={id}
            doctor={data.doctor!.id}
            plan={data.therapy?.plan_id || null}
            duration={data.scheduled.duration_minutes || 30}
            pending={pending}
          />
        ) : (
          <p>
            {uiText("This appointment is not currently eligible for a patient reschedule request.")}{" "}</p>
        )}
      </section>
    </CareLayout>
  );
}
