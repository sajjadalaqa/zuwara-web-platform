import Link from "next/link";
import { getLocale } from "next-intl/server";
import { careList, type Reschedule } from "@/lib/api/zuwara/care";
import {
  CareLayout,
  Facts,
  currency,
  stamp,
  Pager,
  Empty,
  s,
} from "../_care/ui";
import Respond from "./Respond";
export default async function ReschedulingPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    kind?: string;
    appointment_id?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    query = new URLSearchParams();
  if (["pending", "approved", "rejected"].includes(sp.status || ""))
    query.set("status", sp.status!);
  if (["normal", "therapy"].includes(sp.kind || ""))
    query.set("kind", sp.kind!);
  if (sp.appointment_id && /^[1-9]\d*$/.test(sp.appointment_id))
    query.set("appointment_id", sp.appointment_id);
  const data = await careList<Reschedule>(
    "/reschedule-requests",
    Number(sp.page) || 1,
    query,
  );
  return (
    <CareLayout
      title={
        ar
          ? "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629"
          : "Reschedule requests"
      }
      description="A pending request does not move the appointment until it is approved."
    >
      <form className={s.form}>
        <label>
          Status
          <select name="status" defaultValue={sp.status || ""}>
            <option value="">All</option>
            {["pending", "approved", "rejected"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Kind
          <select name="kind" defaultValue={sp.kind || ""}>
            <option value="">All</option>
            <option value="normal">Normal</option>
            <option value="therapy">Therapy</option>
          </select>
        </label>
        {sp.appointment_id ? (
          <input
            type="hidden"
            name="appointment_id"
            value={sp.appointment_id}
          />
        ) : null}
        <button className={s.button}>Filter</button>
      </form>
      {data.items.map((item) => (
        <section className={s.card} key={item.id}>
          <h2>
            {item.appointment_number || "Appointment " + item.appointment_id}
          </h2>
          <Facts
            rows={[
              ["Request", item.id],
              ["Kind", item.kind],
              ["Status", item.status],
              ["Requested by", item.requested_by],
              ["Doctor reference", item.doctor_id],
              ["Therapy group", item.session_group_id],
              ["Previous date", item.previous.date],
              ["Previous time", item.previous.time],
              ["Previous duration", item.previous.duration_minutes],
              ["Requested date", item.requested.date],
              ["Requested time", item.requested.time],
              ["Requested duration", item.requested.duration_minutes],
              ["Duration change", item.duration_change],
              ["Reason", item.reason],
              ["Rejection reason", item.reject_reason],
              [
                "Extra paid",
                currency(
                  item.payment.extra_paid_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              [
                "Credit used",
                currency(
                  item.payment.credit_used_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              [
                "Upgrade required",
                currency(
                  item.payment.required_upgrade_halalas,
                  item.payment.currency,
                  ar,
                ),
              ],
              ["Extra payment recorded", item.payment.has_extra_payment],
              ["Payment method", item.payment.method],
              [
                "Automatic refund on rejection",
                item.payment.automatic_refund_on_rejection,
              ],
              ["Created", stamp(item.created_at, ar)],
              ["Updated", stamp(item.updated_at, ar)],
            ]}
          />
          <p className={s.notice}>
            A downgrade or rejection does not automatically create a refund
            unless the backend explicitly confirms one.
          </p>
          <Link
            href={prefix + "/dashboard/appointments/" + item.appointment_id}
          >
            Appointment details
          </Link>
          {item.kind === "therapy" &&
          item.status === "pending" &&
          ["doctor", "consultant"].includes(item.requested_by) ? (
            <Respond id={String(item.id)} />
          ) : null}
        </section>
      ))}
      {!data.items.length ? (
        <Empty>No reschedule requests match these filters.</Empty>
      ) : null}
      <Pager
        data={data}
        href={(page) => {
          const q = new URLSearchParams(query);
          q.set("page", String(page));
          return prefix + "/dashboard/rescheduling?" + q;
        }}
      />
    </CareLayout>
  );
}
