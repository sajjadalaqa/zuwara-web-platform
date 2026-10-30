import { redirect } from "next/navigation";

export default async function SessionRefreshPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect((locale === "ar" ? "/ar" : "") + "/login-page?reason=session-expired");
}
