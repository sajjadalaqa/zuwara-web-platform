import Link from "next/link";
import { getLocale } from "next-intl/server";
import { careList, type Plan } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, Empty, Pager, bilingual, s } from "../_care/ui";
export default async function TherapyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const [locale, sp] = await Promise.all([getLocale(), searchParams]),
    ar = locale === "ar",
    prefix = ar ? "/ar" : "";
  const data = await careList<Plan>("/therapy-plans", Number(sp.page) || 1);
  return (
    <CareLayout
      title={
        ar
          ? "\u062e\u0637\u0637 \u0627\u0644\u0639\u0644\u0627\u062c"
          : "Therapy plans"
      }
      description="Choose a plan, consultant and individual session times."
    >
      <div className={s.grid}>
        {data.items.map((plan) => (
          <article className={s.card} key={plan.id}>
            <h2>{bilingual(plan.title, ar)}</h2>
            <Facts
              rows={[
                ["Sessions", plan.total_sessions],
                ["Recommended sessions", plan.sessions_recommended],
              ]}
            />
            <Link
              className={s.button}
              href={prefix + "/dashboard/therapy/" + plan.id}
            >
              View plan and availability
            </Link>
          </article>
        ))}
      </div>
      {!data.items.length ? (
        <Empty>No active plans are available for this account.</Empty>
      ) : null}
      <Pager
        data={data}
        href={(page) => prefix + "/dashboard/therapy?page=" + page}
      />
    </CareLayout>
  );
}
