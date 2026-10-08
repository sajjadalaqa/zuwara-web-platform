import type { NotificationKind } from "./types";

type Text = { title: string; body: string };
export type StoredNotification = {
  id: string;
  kind: NotificationKind;
  href?: string;
  read: boolean;
  createdAt: string;
  text: { en: Text; ar: Text };
};

const MIN = 60_000;
const H = 60 * MIN;
const D = 24 * H;

function mk(
  id: string,
  kind: NotificationKind,
  ago: number,
  read: boolean,
  href: string | undefined,
  en: [string, string],
  ar: [string, string]
): StoredNotification {
  return {
    id,
    kind,
    href,
    read,
    createdAt: new Date(Date.now() - ago).toISOString(),
    text: {
      en: { title: en[0], body: en[1] },
      ar: { title: ar[0], body: ar[1] },
    },
  };
}

function seed(): StoredNotification[] {
  return [
    mk("n1", "appointment", 12 * MIN, false, "/dashboard/appointments/apt_2",
      ["Appointment accepted", "Dr. Khalid Al-Harbi accepted your video consultation."],
      ["تم قبول الموعد", "قبل د. خالد الحربي استشارتك المرئية."]),
    mk("n2", "payment", 2 * H, false, "/dashboard/wallet",
      ["Top-up successful", "SAR 500 was added to your wallet."],
      ["تم الشحن بنجاح", "تمت إضافة 500 ر.س إلى محفظتك."]),
    mk("n3", "message", 5 * H, false, "/dashboard/messages",
      ["New message", "Nora Al-Shehri sent you a message about your home visit."],
      ["رسالة جديدة", "أرسلت نورة الشهري رسالة بخصوص زيارتك المنزلية."]),
    mk("n4", "appointment", D + H, true, "/dashboard/appointments/apt_2",
      ["Appointment reminder", "Your video consultation starts in one hour."],
      ["تذكير بالموعد", "تبدأ استشارتك المرئية بعد ساعة."]),
    mk("n5", "payment", D + 4 * H, true, "/dashboard/wallet",
      ["Refund processed", "SAR 150 was refunded to your wallet for APT10009."],
      ["تم الاسترداد", "تم استرداد 150 ر.س إلى محفظتك للموعد APT10009."]),
    mk("n6", "appointment", 2 * D, false, "/dashboard/reviews",
      ["How was your session?", "Leave a review for Dr. Faisal Al-Mutairi."],
      ["كيف كانت جلستك؟", "اترك تقييماً لـ د. فيصل المطيري."]),
    mk("n7", "request", 2 * D + 3 * H, true, "/dashboard/requests",
      ["Service request update", "Your request has been assigned to a provider."],
      ["تحديث طلب الخدمة", "تم إسناد طلبك إلى مزود."]),
    mk("n8", "appointment", 3 * D, true, "/dashboard/appointments/apt_11",
      ["Appointment declined", "Dr. Huda Al-Otaibi couldn't accept your request. You haven't been charged."],
      ["تم رفض الموعد", "تعذّر على د. هدى العتيبي قبول طلبك. لم يتم خصم أي مبلغ."]),
    mk("n9", "system", 4 * D, true, "/dashboard/profile",
      ["Complete your profile", "Add your date of birth and city for better recommendations."],
      ["أكمل ملفك الشخصي", "أضف تاريخ ميلادك ومدينتك للحصول على توصيات أفضل."]),
    mk("n10", "payment", 5 * D, true, "/dashboard/wallet",
      ["Top-up failed", "Your top-up of SAR 300 didn't go through."],
      ["فشل الشحن", "لم تتم عملية شحن 300 ر.س."]),
    mk("n11", "appointment", 6 * D, true, "/dashboard/appointments/apt_9",
      ["Appointment cancelled", "Your appointment with Dr. Sara Al-Qahtani was cancelled."],
      ["تم إلغاء الموعد", "تم إلغاء موعدك مع د. سارة القحطاني."]),
    mk("n12", "system", 9 * D, true, "/provider",
      ["Welcome to Zuwara", "Book healthcare consultations and home services in one place."],
      ["مرحباً بك في زوارة", "احجز استشارات صحية وخدمات منزلية في مكان واحد."]),
  ];
}

declare global {
  // eslint-disable-next-line no-var
  var __zuwaraNotifications: StoredNotification[] | undefined;
}

// TODO (backend): delete this file.
export function getStore(): StoredNotification[] {
  if (!globalThis.__zuwaraNotifications) globalThis.__zuwaraNotifications = seed();
  return globalThis.__zuwaraNotifications;
}