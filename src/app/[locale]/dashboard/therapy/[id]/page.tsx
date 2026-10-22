import { patientApi } from "@/lib/auth/session";
import { getLocale } from "next-intl/server";
import { planDetails, planDoctors } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, bilingual, currency, s } from "../../_care/ui";
import TherapyBooking from "./TherapyBooking";
import { pendingCareIntent } from "../../_care/commands";
export default async function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params,
    ar = (await getLocale()) === "ar";
  const [plan, doctors, pending, dependents] = await Promise.all([
    planDetails(id),
    planDoctors(id),
    pendingCareIntent("therapy"),
    patientApi<{ id: number }[]>("/patients/dependents"),
  ]);
  return (
    <CareLayout title={bilingual(plan.title, ar)}>
      <section className={s.card}>
        <p className={s.summary}>{bilingual(plan.description, ar)}</p>
        <Facts
          rows={[
            ["Plan reference", plan.id],
            ["Sessions", plan.total_sessions],
            ["Session count recommended", plan.sessions_recommended],
          ]}
        />
        <h2>Session prices</h2>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Duration</th>
              <th>Price per session</th>
            </tr>
          </thead>
          <tbody>
            {plan.durations?.map((d) => (
              <tr key={d.duration_minutes}>
                <td>{d.duration_minutes} minutes</td>
                <td>{currency(d.price_per_session_halalas, d.currency, ar)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className={s.grid}>
        {[
          ["Milestones", plan.milestones],
          ["Goals", plan.goals],
        ].map(([title, items]) => (
          <section className={s.card} key={String(title)}>
            <h2>{String(title)}</h2>
            {Array.isArray(items) && items.length ? (
              items.map((item) => (
                <div key={item.id}>
                  <h3>{bilingual(item.title, ar)}</h3>
                  <p>{bilingual(item.description, ar)}</p>
                </div>
              ))
            ) : (
              <p className={s.muted}>Not provided.</p>
            )}
          </section>
        ))}
      </div>
      <section className={s.card}>
        <h2>Frequently asked questions</h2>
        {plan.faqs?.map((faq) => (
          <details key={faq.id}>
            <summary>{bilingual(faq.question, ar)}</summary>
            <p>{bilingual(faq.answer, ar)}</p>
          </details>
        ))}
      </section>
      <TherapyBooking
        plan={plan}
        doctors={doctors}
        pending={pending}
        dependents={dependents.data.map((row) => row.id)}
      />
    </CareLayout>
  );
}
