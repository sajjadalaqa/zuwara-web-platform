import { redirect } from "next/navigation";

export default function LegacyConsultantsPage() {
  redirect("/healthcare/doctors");
}
