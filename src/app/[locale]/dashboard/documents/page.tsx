import PatientFeature from "../_patient/Page";
export default function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <PatientFeature feature="documents" searchParams={searchParams} />;
}
