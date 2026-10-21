import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { startCheckout } from "@/lib/api/zuwara/checkouts";
import { requireSession } from "@/lib/auth/session";
import s from "@/app/[locale]/dashboard/wallet/wallet.module.css";
async function continuePayment(form: FormData) {
  "use server";
  await requireSession();
  const id = String(form.get("appointment") ?? ""), method = String(form.get("method") ?? ""), locale = await getLocale();
  const checkout = await startCheckout(id, method);
  redirect((locale === "ar" ? "/ar" : "") + "/dashboard/checkouts/" + checkout.checkout_id);
}
export default async function PayAppointment({ params, searchParams }: { params: Promise<{ id: string; locale: string }>; searchParams: Promise<{ method?: string }> }) {
  await requireSession();
  const { id, locale } = await params, query = await searchParams, ar = locale === "ar";
  return <section className={s.card}><h1>{ar ? "متابعة دفع الموعد" : "Continue appointment payment"}</h1>
    <form action={continuePayment}><input type="hidden" name="appointment" value={id} />
      <select name="method" defaultValue={query.method === "tamara" ? "tamara" : "myfatoorah"}><option value="myfatoorah">MyFatoorah</option><option value="tamara">Tamara</option></select>
      <button className={s.addBtn}>{ar ? "متابعة" : "Continue"}</button>
    </form></section>;
}
