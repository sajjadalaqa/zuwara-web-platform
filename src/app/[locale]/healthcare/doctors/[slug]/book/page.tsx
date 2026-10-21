import { idFromSlug } from "@/lib/api/zuwara/slugs";
import { notFound } from "next/navigation";
import { patientApi } from "@/lib/auth/session";
import { bookingDoctor } from "@/lib/api/zuwara/booking";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import ConsultationBooking from "./ConsultationBooking";
export default async function BookConsultation({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { slug } = await params;
  const parsedId = idFromSlug(slug) ?? (/^[1-9]\d*$/.test(slug) ? Number(slug) : null);
  const id = parsedId ? String(parsedId) : null;
  if (!id) notFound();
  let doctor;
  try { doctor = await bookingDoctor(id); } catch (error) { if (error instanceof ZuwaraV2Error && error.status === 404) notFound(); throw error; }
  const { data } = await patientApi<{ id: number }[]>("/patients/dependents");
  if (!Array.isArray(data)) throw new Error("Invalid patient list.");
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return <ConsultationBooking doctor={doctor} dependents={data.map(p=>p.id)} today={today} />;
}

