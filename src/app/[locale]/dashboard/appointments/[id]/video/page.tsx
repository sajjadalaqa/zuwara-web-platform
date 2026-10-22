import { notFound } from "next/navigation";
import Link from "next/link";
import { videoStatus } from "@/lib/api/zuwara/video";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import VideoCall from "./VideoCall";
export default async function VideoPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ follow_up_id?: string }> }) {
  const { locale, id } = await params;
  if (!/^[1-9]\d*$/.test(id)) notFound();
  const { follow_up_id: followUpId } = await searchParams;
  let status;
  try { status = await videoStatus(id, followUpId); } catch (error) {
    if (error instanceof ZuwaraV2Error && error.status === 404) notFound();
    throw error;
  }
  const ar = locale === "ar";
  return <div><Link href={(ar ? "/ar" : "") + "/dashboard/appointments/" + id}>{ar ? "العودة إلى الموعد" : "Back to appointment"}</Link>
    <h1>{ar ? "الاستشارة المرئية" : "Video consultation"}</h1><VideoCall id={id} canJoin={status.can_join} followUpId={followUpId} /></div>;
}
