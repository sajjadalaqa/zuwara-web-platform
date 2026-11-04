import { requireSession, patientApi } from "@/lib/auth/session";
import { notFound, unstable_rethrow } from "next/navigation";
import { instantSettings, activeInstant, instantHistory, readInstant } from "@/lib/api/zuwara/instant";
import { consultantCategories, consultantDirectory } from "@/lib/api/zuwara/discovery";
import { ZuwaraV2Error } from "@/lib/api/zuwara/v2";
import InstantFlow from "./InstantFlow";
import { interestFields } from "@/lib/api/zuwara/interest-fields";
async function instantWalletBalance() {
  try {
    const { data } = await patientApi<{ balance_halalas: number; currency: string }>("/wallet");
    if (!Number.isSafeInteger(data?.balance_halalas) || data.balance_halalas < 0 || !/^[A-Z]{3}$/.test(data.currency)) return null;
    return { balanceHalalas: data.balance_halalas, currency: data.currency };
  } catch (error) { unstable_rethrow(error); return null; }
}
export default async function InstantPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ doctor?: string; request?: string }> }) {
  const { locale } = await params, query = await searchParams;
  const session = await requireSession();
  if (query.request && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.request)) notFound();
  const result = await Promise.all([instantSettings(), query.request ? readInstant(query.request) : activeInstant(), instantHistory(), consultantCategories(), consultantDirectory(), patientApi<{ id: number; name?: string; full_name?: string }[]>("/patients/dependents"), instantWalletBalance(), interestFields(undefined, locale).catch(() => null)]).then(data => ({ data, error: null })).catch((error: unknown) => {
    if (!(error instanceof ZuwaraV2Error)) throw error;
    return { data: null, error };
  });
  if (result.error) {
    const error = result.error;
    return <section><h1>{locale === "ar" ? "الاستشارات الفورية" : "Instant consultations"}</h1><p role="alert">{error.code === "INSTANT_V2_DISABLED" ? (locale === "ar" ? "الاستشارات الفورية غير متاحة حالياً." : "Instant consultations are currently unavailable.") : (locale === "ar" ? "تعذر تحميل الطلبات. يرجى المحاولة مجدداً." : "Unable to load instant requests. Please try again.")}</p><p>{error.requestId}</p></section>;
  }
  const [settings, active, history, categories, consultants, dependents, walletBalance, interests] = result.data!;
  return <InstantFlow locale={locale} identity={session.user.id} settings={settings.data} initial={active} history={history} categories={categories}
    consultants={consultants.filter(row => row.accepts_instant?.private).map(row => ({ id: row.id, name: locale === "ar" ? row.name_ar ?? row.name : row.name }))}
    dependents={dependents.data.map(row => ({ id: row.id, name: row.full_name ?? row.name ?? String(row.id) }))}
    selectedDoctor={query.doctor ?? ""} initialInterests={interests} walletBalance={walletBalance} cardEnabled={process.env.INSTANT_MYFATOORAH_WEB_ENABLED === "true"} />;
}
