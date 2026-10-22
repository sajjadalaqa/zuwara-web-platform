import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
  request,
  uuid,
  numeric,
  type Complaint,
  type ServiceRequest,
  type Source,
} from "@/lib/api/patient-dashboard";
import { CareLayout, Facts, stamp, s } from "./../_care/ui";
export default async function Detail({
  kind,
  params,
  searchParams,
}: {
  kind: "complaints" | "requests";
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params,
    q = await searchParams,
    backend: Source =
      kind === "requests" || q.source === "d4h" ? "d4h" : "zuwara",
    ar = (await getLocale()) === "ar";
  let ref;
  try {
    ref = kind === "complaints" ? uuid(id) : numeric(id);
  } catch {
    notFound();
  }
  if (kind === "complaints") {
    const { data: r } = await request<Complaint>(backend, "/complaints/" + ref);
    return (
      <CareLayout title={r.subject}>
        <section className={s.card}>
          <p style={{ whiteSpace: "pre-wrap" }}>{r.message}</p>
          <Facts
            rows={[
              ["Reference", r.id],
              ["Booking reference", r.booking_id],
              ["Status", r.status],
              ["Created", stamp(r.created_at, ar)],
              ["Updated", stamp(r.updated_at, ar)],
            ]}
          />
          <p>Replies are not available here.</p>
        </section>
      </CareLayout>
    );
  }
  const { data: r } = await request<ServiceRequest>(
    "d4h",
    "/service-requests/" + ref,
  );
  return (
    <CareLayout title={r.title}>
      <section className={s.card}>
        <p style={{ whiteSpace: "pre-wrap" }}>{r.description}</p>
        <Facts
          rows={[
            ["Reference", r.id],
            ["Status", r.status],
            ["Services", r.service_ids.join(", ")],
            ["Preferred date", r.preferred_date],
            ["Created", stamp(r.created_at, ar)],
          ]}
        />
        <p>
          This is a custom request, not a confirmed booking. Offer acceptance
          and payment are not available here.
        </p>
      </section>
    </CareLayout>
  );
}
