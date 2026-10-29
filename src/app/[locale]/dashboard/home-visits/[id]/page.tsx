import { getUiText } from "@/i18n/server-ui-text";
import { getLocale } from "next-intl/server";
import { homeBooking } from "@/lib/api/d4h/history";
import { CareLayout, Facts, stamp, currency, s } from "../../_care/ui";
import PayVisit from "./PayVisit";
export default async function HomeVisitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uiText = await getUiText();
  const { id } = await params,
    ar = (await getLocale()) === "ar",
    item = await homeBooking(id);
  return (
    <CareLayout
      title={ar ? item.service.name_ar || item.service.name : item.service.name}
    >
      <section className={s.card}>
        <Facts
          rows={[
            [uiText("Reference"), item.id],
            [uiText("Booking group"), item.booking_group_id],
            [uiText("Status"), item.status],
            [uiText("Provider"), item.provider.name],
            [uiText("Date"), item.scheduled.date],
            [uiText("Time"), item.scheduled.booking_slot],
            [uiText("Start"), stamp(item.scheduled.start_at, ar)],
            ["End", stamp(item.scheduled.end_at, ar)],
            [uiText("Address"), item.address],
            [uiText("Description"), item.description],
            [uiText("Subtotal"), item.amount.subtotal + " " + item.amount.currency],
            [uiText("Discount"), item.amount.discount + " " + item.amount.currency],
            ["Tax", item.amount.tax + " " + item.amount.currency],
            [
              uiText("Total"),
              currency(item.amount.total_halalas, item.amount.currency, ar),
            ],
            [uiText("Created"), stamp(item.created_at, ar)],
            [uiText("Updated"), stamp(item.updated_at, ar)],
          ]}
        />
      </section>
      <section className={s.card}>
        <h2>{uiText("Payment")}</h2>
        {item.payment ? (
          <Facts
            rows={[
              ["State", item.payment.payment_state || item.payment.status],
              ["Method", item.payment.payment_method || item.payment.method],
              ["Payment reference", item.payment.id],
              ["Transaction", item.payment.transaction_id || item.payment.reference],
              ["Paid", stamp(item.payment.paid_at, ar)],
              [
                "Amount",
                item.payment.amount_halalas !== undefined
                  ? currency(
                      item.payment.amount_halalas,
                      item.payment.currency || item.amount.currency,
                      ar,
                    )
                  : null,
              ],
            ]}
          />
        ) : (
          <p className={s.muted}>{uiText("No payment record returned.")}</p>
        )}
        {item.booking_group_id &&
        item.payment?.status !== "paid" &&
        item.payment?.payment_state !== "paid" ? (
          <PayVisit group={item.booking_group_id} />
        ) : null}
      </section>
      <section className={s.card}>
        <h2>{uiText("Timeline")}</h2>
        {item.timeline?.map((event) => (
          <div key={event.id}>
            <h3>{event.message || event.key}</h3>
            <p>
              {event.type} ? {stamp(event.occurred_at, ar)}
            </p>
          </div>
        ))}
      </section>
    </CareLayout>
  );
}
