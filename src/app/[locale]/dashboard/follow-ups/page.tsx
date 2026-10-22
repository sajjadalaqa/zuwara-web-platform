import Link from "next/link";
import { getLocale } from "next-intl/server";
import { careList, type FollowUp } from "@/lib/api/zuwara/care";
import { CareLayout, Facts, Pager, Empty, stamp, s } from "../_care/ui";
export default async function FollowUpsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const status = ["scheduled", "available", "completed", "expired"].includes(
    sp.status || "",
  )
    ? sp.status
    : "";
  const query = new URLSearchParams(status ? { status } : {});
  const data = await careList<FollowUp>(
    "/follow-ups",
    Number(sp.page) || 1,
    query,
  );
  return (
    <CareLayout
      title={
        ar
          ? "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a"
          : "Follow-ups"
      }
      description="Follow-ups are scheduled and completed by your consultant."
    >
      <form className={s.form}>
        <label>
          Status
          <select name="status" defaultValue={status}>
            <option value="">All</option>
            {["scheduled", "available", "completed", "expired"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <button className={s.button}>Filter</button>
      </form>
      <div className={s.grid}>
        {data.items.map((item) => (
          <article className={s.card} key={item.id}>
            <h2>{ar ? item.status_label_ar : item.status_label}</h2>
            <Facts
              rows={[
                ["Appointment", item.appointment_id],
                ["Scheduled", stamp(item.scheduled_at, ar)],
                ["Access ends", stamp(item.available_until, ar)],
                ["Duration", item.duration_minutes],
              ]}
            />
            <Link href={prefix + "/dashboard/follow-ups/" + item.id}>
              View follow-up
            </Link>
          </article>
        ))}
      </div>
      {!data.items.length ? (
        <Empty>No follow-ups match this selection.</Empty>
      ) : null}
      <Pager
        data={data}
        href={(page) =>
          prefix +
          "/dashboard/follow-ups?" +
          new URLSearchParams({
            page: String(page),
            ...(status ? { status } : {}),
          })
        }
      />
    </CareLayout>
  );
}
