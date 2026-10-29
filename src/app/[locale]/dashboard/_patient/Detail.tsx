import { getUiText } from "@/i18n/server-ui-text";
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
  const uiText = await getUiText();
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
              [uiText("Reference"), r.id],
              [uiText("Booking reference"), r.booking_id],
              [uiText("Status"), r.status],
              [uiText("Created"), stamp(r.created_at, ar)],
              [uiText("Updated"), stamp(r.updated_at, ar)],
            ]}
          />
          <p>{uiText("Replies are not available here.")}</p>
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
            [uiText("Reference"), r.id],
            [uiText("Status"), r.status],
            [uiText("Services"), r.service_ids.join(", ")],
            [uiText("Preferred date"), r.preferred_date],
            [uiText("Created"), stamp(r.created_at, ar)],
          ]}
        />
        <p>
          {uiText("This is a custom request, not a confirmed booking. Offer acceptance and payment are not available here.")}{" "}</p>
      </section>
    </CareLayout>
  );
}
