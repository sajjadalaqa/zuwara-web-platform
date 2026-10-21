import Link from "next/link";
import { notFound } from "next/navigation";
import { chatHistory } from "@/lib/api/zuwara/chat";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import AppointmentChat from "./AppointmentChat";
export default async function ChatPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id, locale } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  let initial;
  try { initial = await chatHistory(id); } catch (error) { if (error instanceof ZuwaraV2Error && error.status === 404) notFound(); throw error; }
  const ar = locale === "ar";
  return <div><Link href={(ar ? "/ar" : "") + "/dashboard/appointments/" + id}>{ar ? "العودة إلى الموعد" : "Back to appointment"}</Link>
    <h1>{ar ? "محادثة الموعد" : "Appointment chat"}</h1><AppointmentChat id={id} initial={initial} /></div>;
}
