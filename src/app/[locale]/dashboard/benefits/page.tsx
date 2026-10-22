import { getLocale } from "next-intl/server";
import { careList, type Coupon, type Contract } from "@/lib/api/zuwara/care";
import {
  CareLayout,
  Facts,
  Empty,
  Pager,
  currency,
  stamp,
  s,
} from "../_care/ui";
import CouponLookup from "./CouponLookup";
export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    contract_page?: string;
    date?: string;
  }>;
}) {
  const sp = await searchParams,
    ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "";
  const date = sp.date && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : "";
  const [coupons, contracts] = await Promise.all([
    careList<Coupon>("/coupons", Number(sp.page) || 1),
    careList<Contract>(
      "/corporate-contracts",
      Number(sp.contract_page) || 1,
      new URLSearchParams(date ? { date } : {}),
    ),
  ]);
  return (
    <CareLayout
      title={
        ar
          ? "\u0627\u0644\u0645\u0632\u0627\u064a\u0627"
          : "Coupons and corporate benefits"
      }
    >
      <p className={s.notice}>
        Coupons require a booking preview to confirm eligibility. Corporate
        contracts are read-only; self-booking against a contract is not
        supported by this API.
      </p>
      <h2>Available coupons</h2>
      <div className={s.grid}>
        {coupons.items.map((item) => (
          <section className={s.card} key={item.id}>
            <h3>{item.name}</h3>
            <Facts
              rows={[
                ["Code", item.code],
                ["Discount", item.percentage + "%"],
                [
                  "Minimum amount",
                  currency(item.minimum_amount_halalas, "SAR", ar),
                ],
                [
                  "Maximum discount",
                  currency(item.maximum_discount_halalas, "SAR", ar),
                ],
                ["Expires", stamp(item.expires_at, ar)],
                ["Booking preview required", item.requires_booking_preview],
              ]}
            />
          </section>
        ))}
      </div>
      {!coupons.items.length ? (
        <Empty>No public coupons are available for this account.</Empty>
      ) : null}
      <Pager
        data={coupons}
        href={(page) =>
          prefix +
          "/dashboard/benefits?" +
          new URLSearchParams({
            page: String(page),
            contract_page: String(contracts.page),
            ...(date ? { date } : {}),
          })
        }
      />
      <CouponLookup />
      <h2>Corporate contracts</h2>
      <form className={s.form}>
        <label>
          Valid on date
          <input type="date" name="date" defaultValue={date} />
        </label>
        <button className={s.button}>Check contracts</button>
      </form>
      <div className={s.grid}>
        {contracts.items.map((item) => (
          <section className={s.card} key={item.id}>
            <h3>{item.name}</h3>
            <Facts
              rows={[
                ["Contract number", item.number],
                ["Start date", item.start_date],
                ["End date", item.end_date],
                [
                  "Patient self-booking supported",
                  item.patient_booking_supported,
                ],
              ]}
            />
          </section>
        ))}
      </div>
      {!contracts.items.length ? (
        <Empty>
          No corporate contracts were returned for your account and this date.
        </Empty>
      ) : null}
      <Pager
        data={contracts}
        href={(page) =>
          prefix +
          "/dashboard/benefits?" +
          new URLSearchParams({
            contract_page: String(page),
            page: String(coupons.page),
            ...(date ? { date } : {}),
          })
        }
      />
    </CareLayout>
  );
}
