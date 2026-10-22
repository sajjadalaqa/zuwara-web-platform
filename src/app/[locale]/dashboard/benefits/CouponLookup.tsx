"use client";
import { useState, useTransition } from "react";
import { findCouponAction } from "../_care/commands";
import type { Coupon } from "@/lib/api/zuwara/care";
import s from "../_care/care.module.css";
export default function CouponLookup() {
  const [code, setCode] = useState(""),
    [rows, setRows] = useState<Coupon[]>([]),
    [message, setMessage] = useState(""),
    [pending, start] = useTransition();
  return (
    <section className={s.card}>
      <h2>Have a coupon code?</h2>
      <form
        className={s.form}
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            try {
              const result = await findCouponAction(code);
              setRows(result.ok ? result.coupons : []);
              setMessage(
                result.ok && !result.coupons.length
                  ? "No available coupon matches that code."
                  : result.ok
                    ? ""
                    : "Coupon lookup is unavailable.",
              );
            } catch {
              setMessage("Coupon lookup failed. Please retry.");
            }
          });
        }}
      >
        <label>
          Known coupon code
          <input
            value={code}
            maxLength={100}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        <button className={s.button} disabled={pending || !code.trim()}>
          Check code
        </button>
      </form>
      {message ? <p role="status">{message}</p> : null}
      {rows.map((row) => (
        <div key={row.id}>
          <h3>{row.name}</h3>
          <p>
            Code: {row.code} ? {row.percentage}%
          </p>
          <p>
            Minimum: {(row.minimum_amount_halalas / 100).toFixed(2)} SAR ?
            Maximum discount: {(row.maximum_discount_halalas / 100).toFixed(2)}{" "}
            SAR
          </p>
          <p>Expires: {row.expires_at || "Not specified"}</p>
          <p>A booking preview is required to confirm the discount.</p>
        </div>
      ))}
    </section>
  );
}
