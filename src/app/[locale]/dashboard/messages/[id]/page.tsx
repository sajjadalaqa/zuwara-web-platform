import { notFound, redirect } from "next/navigation";
import { allAppointments } from "@/lib/api/zuwara/appointments";
export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const owned = (await allAppointments()).some(
    (row) => String(row.id) === id && row.status.code !== 7,
  );
  if (!owned) notFound();
  redirect(
    (locale === "ar" ? "/ar" : "") + "/dashboard/appointments/" + id + "/chat",
  );
}
