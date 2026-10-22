import Link from "next/link";
import { getLocale } from "next-intl/server";
import { homeHistory } from "@/lib/api/d4h/history";
import { CareLayout, Facts, Pager, Empty, currency, s } from "../_care/ui";
export default async function HomeVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    from_date?: string;
    to_date?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const query = new URLSearchParams();
  if (sp.q?.trim()) query.set("q", sp.q.trim().slice(0, 200));
  if (sp.status && /^[a-z_]{1,40}$/.test(sp.status))
    query.set("status", sp.status);
  for (const key of ["from_date", "to_date"] as const) {
    if (sp[key] && /^\d{4}-\d{2}-\d{2}$/.test(sp[key]!))
      query.set(key, sp[key]!);
  }
  const data = await homeHistory(Number(sp.page) || 1, query);
  return (
    <CareLayout
      title={
        ar
          ? "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629"
          : "Home-visit history"
      }
    >
      <form className={s.form}>
        <label>
          Search
          <input name="q" defaultValue={sp.q} />
        </label>
        <label>
          From
          <input type="date" name="from_date" defaultValue={sp.from_date} />
        </label>
        <label>
          To
          <input type="date" name="to_date" defaultValue={sp.to_date} />
        </label>
        <button className={s.button}>Filter visits</button>
      </form>
      <div className={s.grid}>
        {data.items.map((item) => (
          <article className={s.card} key={item.id}>
            <h2>
              {ar
                ? item.service.name_ar || item.service.name
                : item.service.name}
            </h2>
            <Facts
              rows={[
                ["Reference", item.id],
                ["Provider", item.provider.name],
                ["Status", item.status],
                ["Date", item.scheduled.date],
                ["Time", item.scheduled.booking_slot],
                [
                  "Total",
                  currency(item.amount.total_halalas, item.amount.currency, ar),
                ],
              ]}
            />
            <Link href={prefix + "/dashboard/home-visits/" + item.id}>
              Visit details
            </Link>
          </article>
        ))}
      </div>
      {!data.items.length ? (
        <Empty>No home visits match this selection.</Empty>
      ) : null}
      <Pager
        data={data}
        href={(page) => {
          const q = new URLSearchParams(query);
          q.set("page", String(page));
          return prefix + "/dashboard/home-visits?" + q;
        }}
      />
    </CareLayout>
  );
}
