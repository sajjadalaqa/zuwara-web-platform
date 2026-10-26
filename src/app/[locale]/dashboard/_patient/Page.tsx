import ComplaintsUI, { ComplaintsLayout, s as complaintStyles } from "../complaints/ComplaintsUI";
import AddressesUI, { AddressesLayout } from "../addresses/AddressesUI";
import LoyaltyUI, { LoyaltyLayout, s as loyaltyStyles } from "../referral/LoyaltyUI";
import ReviewsUI, { ReviewsLayout, s as reviewStyles } from "../reviews/ReviewsUI";
import DocumentsLayout from "../documents/DocumentsLayout";
import documentStyles from "../documents/documents.module.css";
import SavedUI, { s as savedStyles } from "../saved/SavedUI";
import { Heart } from "lucide-react";
import RequestsUI, { RequestsLayout } from "../requests/RequestsUI";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { unstable_rethrow } from "next/navigation";
import { patientApi, requireSession } from "@/lib/auth/session";

import {
  customServices,
  favorites,
  list,
  request,
  type Source,
  type Review,
  type Complaint,
  type Document,
  type ServiceRequest,
  type Address,
  type Loyalty,
} from "@/lib/api/patient-dashboard";
import { CareLayout, Facts, Empty, stamp, s } from "../_care/ui";
import Form from "./Form";
type Feature =
  | "saved"
  | "reviews"
  | "complaints"
  | "referral"
  | "requests"
  | "addresses"
  | "documents"
  | "profile";
type Query = Record<string, string | string[] | undefined>;
const titles: Record<Feature, [string, string]> = {
  saved: [
    "Saved providers",
    "\u0627\u0644\u0645\u0632\u0648\u062f\u0648\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0648\u0646",
  ],
  reviews: [
    "Reviews",
    "\u0627\u0644\u062a\u0642\u064a\u064a\u0645\u0627\u062a",
  ],
  complaints: ["Complaints", "\u0627\u0644\u0634\u0643\u0627\u0648\u0649"],
  referral: [
    "Referral and loyalty",
    "\u0627\u0644\u0625\u062d\u0627\u0644\u0629 \u0648\u0627\u0644\u0648\u0644\u0627\u0621",
  ],
  requests: [
    "Custom service requests",
    "\u0637\u0644\u0628\u0627\u062a \u0627\u0644\u062e\u062f\u0645\u0627\u062a",
  ],
  addresses: [
    "Saved addresses",
    "\u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646",
  ],
  documents: [
    "My uploaded documents",
    "\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u064a",
  ],
  profile: [
    "My profile",
    "\u0645\u0644\u0641\u064a \u0627\u0644\u0634\u062e\u0635\u064a",
  ],
};
const routes: Record<Feature, string> = {
  saved: "saved",
  reviews: "reviews",
  complaints: "complaints",
  referral: "referral",
  requests: "requests",
  addresses: "addresses",
  documents: "documents",
  profile: "profile",
};
function Field({
  name,
  label,
  type = "text",
  max,
  required = false,
  value,
  step,
}: {
  name: string;
  label: string;
  type?: string;
  max?: number;
  required?: boolean;
  value?: string | number;
  step?: string;
}) {
  return (
    <label className={s.field}>
      {label}
      {type === "textarea" ? (
        <textarea
          className={s.input}
          name={name}
          maxLength={max}
          required={required}
          defaultValue={value}
        />
      ) : (
        <input
          className={s.input}
          name={name}
          type={type}
          maxLength={max}
          required={required}
          defaultValue={value}
          step={step}
        />
      )}
    </label>
  );
}
function BookingField() {
  return (
    <Field
      name="booking_id"
      label="Appointment / visit reference (optional)"
      type="number"
      step="1"
    />
  );
}
export default async function PatientFeature({
  feature,
  searchParams = Promise.resolve({}),
}: {
  feature: Feature;
  searchParams?: Promise<Query>;
}) {
  await requireSession();
  const ar = (await getLocale()) === "ar",
    prefix = ar ? "/ar" : "",
    q = await searchParams,
    single = (v: Query[string]) => (typeof v === "string" ? v : ""),
    backend: Source = ["addresses", "referral", "requests"].includes(feature)
      ? "d4h"
      : feature !== "complaints" && single(q.source) === "d4h"
        ? "d4h"
        : "zuwara",
    page = Math.max(1, Number(single(q.page)) || 1),
    base = prefix + "/dashboard/" + routes[feature],
    path = (n: number) =>
      base + "?" + new URLSearchParams({ source: backend, page: String(n) });
  let content: React.ReactNode,
    pagination: { current_page: number; has_more: boolean } | undefined;
  try {
    if (feature === "saved") {
      const result = await favorites(backend, page);
      pagination = result.meta?.pagination;
      content = <SavedUI rows={result.data} backend={backend} prefix={prefix} base={base} ar={ar} />;
    } else if (feature === "reviews") {
      const result = await list<Review>(backend, "/reviews", page);
      pagination = result.meta?.pagination;
      content = <ReviewsUI rows={result.data} ar={ar} backend={backend} />;
    } else if (feature === "complaints") {
      const result = await list<Complaint>(backend, "/complaints", page);
      pagination = result.meta?.pagination;
      content = <ComplaintsUI rows={result.data} base={base} ar={ar} />;
    } else if (feature === "documents") {
      const result = await list<Document>(backend, "/patient-documents", page);
      pagination = result.meta?.pagination;
      content = (
        <>

          <section className={s.card} id="upload-document"><h2>Upload a document</h2>
            <p>
              Patient-authored PDFs are separate from official clinical reports.
              Uploading does not share a file in chat or assign it to a doctor.
            </p>
            <Form
              op="document-upload"
              uploadLimit={process.env.VERCEL ? 4000000 : 50 * 1024 * 1024}
              source={backend}
              label="Upload PDFs"
              uncertain
            >
              <Field name="title" label="Title" max={150} required />
              <label>
                Category
                <select name="category" className={s.input}>
                  <option value="lab_result">Lab result</option>
                  <option value="xray">X-ray</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <BookingField />
              <label>
                1 to 5 PDFs, up to 10 MB each
                {process.env.VERCEL
                  ? " (4 MB total per upload on this site)"
                  : ""}
                <input
                  name="files[]"
                  type="file"
                  accept="application/pdf"
                  multiple
                  required
                />
              </label>
            </Form>
          </section>
          {result.data.map((r) => (
            <section className={s.card} key={r.id}>
              <h2>{r.title}</h2>
              <p>Patient-uploaded document</p>
              <Facts
                rows={[
                  ["Reference", r.id],
                  ["Category", r.category],
                  ["Type", r.document_type],
                  ["Issuer", r.issuer],
                  ["Booking reference", r.booking_id],
                  ["Filename", r.original_name],
                  ["Format", r.mime_type],
                  ["Size (bytes)", r.size_bytes],
                  ["Uploaded", stamp(r.created_at, ar)],
                ]}
              />
              <a
                className={s.button}
                href={base + "/" + r.id + "/file?source=" + backend}
              >
                Download PDF
              </a>
              <Form
                op="document-delete"
                source={backend}
                id={r.id}
                label="Delete patient upload"
              />
            </section>
          ))}
          {!result.data.length && (
            <Empty>No patient-uploaded documents in this account.</Empty>
          )}
        </>
      );
    } else if (feature === "addresses") {
      const { data } = await request<Address[]>("d4h", "/patients/addresses");
      if (!Array.isArray(data)) throw Error("Invalid addresses.");
      content = <AddressesUI rows={data} ar={ar} />;
    } else if (feature === "referral") {
      const [loyalty, history] = await Promise.all([
        request<Loyalty>("d4h", "/loyalty"),
        list<{
          id: number;
          type: string;
          points: number;
          direction: string;
          source: string;
          created_at: string;
        }>("d4h", "/loyalty/history", page),
      ]);
      pagination = history.meta?.pagination;
      const l = loyalty.data;
      content = <LoyaltyUI loyalty={l} history={history.data} ar={ar} />;
    } else if (feature === "requests") {
      const result = await list<ServiceRequest>(
        "d4h",
        "/service-requests",
        page,
      );
      pagination = result.meta?.pagination;
      let services: { id: number; name: string }[] = [];
      let catalogError = false;
      try {
        services = await customServices();
      } catch (e) {
        unstable_rethrow(e);
        catalogError = true;
      }
      content = (
        <RequestsUI
          rows={result.data}
          services={services}
          catalogError={catalogError}
          base={base}
          ar={ar}
          total={result.meta?.pagination?.total}
        />
      );
    } else {
      type Profile = {
        id: string;
        full_name: string;
        full_name_ar: string | null;
        email: string | null;
        country_code: string;
        phone_number: string;
        date_of_birth: string | null;
        gender: number | null;
        city: string | null;
        national_id: string | null;
        profile_image: string | null;
      };
      const { data: p } = await patientApi<Profile>("/patients/me");
      content = (
        <>
          <section className={s.card}>
            <h2>{p.full_name}</h2>
            <Facts
              rows={[
                ["Phone", p.country_code + " " + p.phone_number],
                ["Email", p.email],
              ]}
            />
            <p>
              Phone changes require a separate verified identity flow. Your
              home-visit account name and email update on a later identity sync.
            </p>
            <Form op="profile" label="Save profile">
              <Field
                name="full_name"
                label="Full name"
                max={150}
                value={p.full_name}
                required
              />
              <Field
                name="full_name_ar"
                label="Arabic full name"
                max={150}
                value={p.full_name_ar ?? ""}
              />
              <Field
                name="email"
                label="Email"
                type="email"
                max={190}
                value={p.email ?? ""}
              />
              <Field
                name="date_of_birth"
                label="Date of birth"
                type="date"
                value={p.date_of_birth ?? ""}
              />
              <label>
                Gender
                <select
                  name="gender"
                  defaultValue={p.gender ?? ""}
                  className={s.input}
                >
                  <option value="">Not specified</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                </select>
              </label>
              <Field name="city" label="City" max={150} value={p.city ?? ""} />
              <Field
                name="national_id"
                label="National ID"
                max={20}
                value={p.national_id ?? ""}
              />
            </Form>
          </section>
          <section className={s.card}>
            <h2>Profile photo</h2>
            <Form op="avatar" label="Upload profile photo" uncertain>
              <label>
                JPEG, PNG or WebP, up to 2 MB
                <input
                  type="file"
                  name="image"
                  accept="image/jpeg,image/png,image/webp"
                  required
                />
              </label>
            </Form>
          </section>
          <Link href={prefix + "/dashboard/addresses"}>Manage addresses</Link>
        </>
      );
    }
  } catch (error) {
    unstable_rethrow(error);
    content = (
      <section className={s.card}>
        <h2>
          {ar
            ? "\u062a\u0639\u0630\u0631 \u062a\u062d\u0645\u064a\u0644 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a"
            : "This account's data could not be loaded"}
        </h2>
        <p>
          The service may be unavailable or the linked home-visit session may
          need renewing. Existing records have not been replaced with sample
          data.
        </p>
        <a href={path(page)}>Try again</a>
      </section>
    );
  }
  if (feature === "complaints") return <ComplaintsLayout ar={ar}>
    {content}
    {pagination && (pagination.current_page > 1 || pagination.has_more) && <nav className={complaintStyles.pagination} aria-label={ar ? "صفحات الشكاوى" : "Complaint pages"}>
      {pagination.current_page > 1 && <Link href={path(pagination.current_page - 1)}>{ar ? "السابق" : "Previous"}</Link>}
      <span>{ar ? "صفحة" : "Page"} {pagination.current_page}</span>
      {pagination.has_more && <Link href={path(pagination.current_page + 1)}>{ar ? "التالي" : "Next"}</Link>}
    </nav>}
  </ComplaintsLayout>;
  if (feature === "addresses") return <AddressesLayout ar={ar}>{content}</AddressesLayout>;
  if (feature === "referral") return <LoyaltyLayout ar={ar}>
    {content}
    {pagination && (pagination.current_page > 1 || pagination.has_more) && <nav className={loyaltyStyles.pagination} aria-label={ar ? "صفحات سجل النقاط" : "Loyalty history pages"}>
      {pagination.current_page > 1 && <Link href={path(pagination.current_page - 1)}>{ar ? "السابق" : "Previous"}</Link>}
      <span>{ar ? "صفحة" : "Page"} {pagination.current_page}</span>
      {pagination.has_more && <Link href={path(pagination.current_page + 1)}>{ar ? "التالي" : "Next"}</Link>}
    </nav>}
  </LoyaltyLayout>;
  if (feature === "reviews") return <ReviewsLayout ar={ar} backend={backend} base={base}>
    {content}
    {pagination && (pagination.current_page > 1 || pagination.has_more) && <nav className={reviewStyles.pagination} aria-label={ar ? "صفحات التقييمات" : "Review pages"}>
      {pagination.current_page > 1 && <Link href={path(pagination.current_page - 1)}>{ar ? "السابق" : "Previous"}</Link>}
      <span>{ar ? "صفحة" : "Page"} {pagination.current_page}</span>
      {pagination.has_more && <Link href={path(pagination.current_page + 1)}>{ar ? "التالي" : "Next"}</Link>}
    </nav>}
  </ReviewsLayout>;
  if (feature === "documents") return <DocumentsLayout ar={ar} backend={backend} base={base} prefix={prefix}>
    {content}
    {pagination && (pagination.current_page > 1 || pagination.has_more) && <nav className={documentStyles.pagination} aria-label={ar ? "صفحات المستندات" : "Document pages"}>
      {pagination.current_page > 1 && <Link href={path(pagination.current_page - 1)}>{ar ? "السابق" : "Previous"}</Link>}
      <span>{ar ? "صفحة" : "Page"} {pagination.current_page}</span>
      {pagination.has_more && <Link href={path(pagination.current_page + 1)}>{ar ? "التالي" : "Next"}</Link>}
    </nav>}
  </DocumentsLayout>;
  if (feature === "saved") return <div className={savedStyles.page}><header className={savedStyles.header}><span className={savedStyles.heart}><Heart size={25}/></span><div><h1>{ar ? "\u0627\u0644\u0627\u0633\u062a\u0634\u0627\u0631\u064a\u0648\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0648\u0646" : "Saved consultants"}</h1><p>{ar ? "\u0627\u0644\u0631\u0639\u0627\u064a\u0629 \u0627\u0644\u062a\u064a \u062a\u0641\u0636\u0644\u0647\u0627\u060c \u0641\u064a \u0645\u0643\u0627\u0646 \u0648\u0627\u062d\u062f." : "The care you connect with, kept close for your next visit."}</p></div></header>{content}{pagination && <nav className={savedStyles.pagination} aria-label="Saved consultant pages">{pagination.current_page > 1 && <Link href={path(pagination.current_page-1)}>Previous</Link>}<span>Page {pagination.current_page}</span>{pagination.has_more && <Link href={path(pagination.current_page+1)}>Next</Link>}</nav>}</div>;
  if (feature === "requests")
    return (
      <RequestsLayout ar={ar}>
        {content}
        {pagination && (
          <nav className={s.actions} aria-label="Request pages">
            {pagination.current_page > 1 && (
              <Link href={path(pagination.current_page - 1)}>Previous</Link>
            )}
            <span>Page {pagination.current_page}</span>
            {pagination.has_more && (
              <Link href={path(pagination.current_page + 1)}>Next</Link>
            )}
          </nav>
        )}
      </RequestsLayout>
    );

  return (
    <CareLayout title={titles[feature][ar ? 1 : 0]}>
      <nav className={s.actions}>
        {!["addresses", "referral", "requests", "profile"].includes(
          feature,
        ) && (
          <>
            <Link href={base + "?source=zuwara"}>Consultations</Link>
            <Link href={base + "?source=d4h"}>Home visits</Link>
          </>
        )}
      </nav>
      {content}
      {pagination && (
        <nav className={s.actions}>
          {pagination.current_page > 1 && (
            <Link href={path(pagination.current_page - 1)}>Previous</Link>
          )}
          <span>Page {pagination.current_page}</span>
          {pagination.has_more && (
            <Link href={path(pagination.current_page + 1)}>Next</Link>
          )}
        </nav>
      )}
    </CareLayout>
  );
}
