import Link from "next/link";
import { readCheckout, checkoutUrl } from "@/lib/api/zuwara/checkouts";
import Payment from "./Payment";
export default async function CheckoutPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params;
  const checkout = await readCheckout(id), ar = locale === "ar";
  const scriptUrl = process.env.MYFATOORAH_EMBED_ENV === "sandbox" ? "https://demo.myfatoorah.com/sessions/v1/session.js" : "https://sa.myfatoorah.com/sessions/v1/session.js";
  return <div><Link href={(ar ? "/ar" : "") + "/dashboard/appointments/" + checkout.appointment_id}>{ar ? "العودة إلى الموعد" : "Back to appointment"}</Link>
    <h1>{ar ? "إتمام الدفع" : "Complete payment"}</h1>
    <Payment initial={checkout} scriptUrl={scriptUrl} hostedUrl={checkout.checkout_url ? checkoutUrl(checkout.checkout_url) : null} />
  </div>;
}
