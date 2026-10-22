import {
  LayoutDashboard, CalendarCheck, Home, MessageSquare, Heart,
  FileText, Star, Wallet, Gift, User, Bell, AlertCircle, HelpCircle,
} from "lucide-react";

export type NavItem = {
  key: string;
  en: string;
  ar: string;
  href: string; // relative to /[locale]
  icon: React.ComponentType<{ size?: number }>;
};

export const navGroups: { en: string; ar: string; items: NavItem[] }[] = [
  {
    en: "Main", ar: "الرئيسية",
    items: [
      { key: "overview", en: "Overview", ar: "نظرة عامة", href: "/dashboard", icon: LayoutDashboard },
      { key: "appointments", en: "Appointments", ar: "المواعيد", href: "/dashboard/appointments", icon: CalendarCheck },
      { key: "requests", en: "Service Requests", ar: "طلبات الخدمات", href: "/dashboard/requests", icon: Home },
      { key: "messages", en: "Messages", ar: "الرسائل", href: "/dashboard/messages", icon: MessageSquare },
    ],
  },
  {
    en: "Care", ar: "الرعاية",
    items: [
      { key: "saved", en: "Saved Providers", ar: "المزودون المحفوظون", href: "/dashboard/saved", icon: Heart },
      { key: "therapy", en: "Therapy Plans", ar: "\u062e\u0637\u0637 \u0627\u0644\u0639\u0644\u0627\u062c", href: "/dashboard/therapy", icon: Heart },
      { key: "rescheduling", en: "Rescheduling", ar: "\u0625\u0639\u0627\u062f\u0629 \u0627\u0644\u062c\u062f\u0648\u0644\u0629", href: "/dashboard/rescheduling", icon: CalendarCheck },
      { key: "followups", en: "Follow-ups", ar: "\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0627\u062a", href: "/dashboard/follow-ups", icon: CalendarCheck },
      { key: "homevisits", en: "Home Visits", ar: "\u0627\u0644\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0646\u0632\u0644\u064a\u0629", href: "/dashboard/home-visits", icon: Home },
      { key: "documents", en: "My Documents", ar: "\u0645\u0633\u062a\u0646\u062f\u0627\u062a\u064a", href: "/dashboard/documents", icon: FileText },
      { key: "records", en: "Medical Records", ar: "السجلات الطبية", href: "/dashboard/records", icon: FileText },
      { key: "reviews", en: "Reviews", ar: "التقييمات", href: "/dashboard/reviews", icon: Star },
    ],
  },
  {
    en: "Payments", ar: "المدفوعات",
    items: [
      { key: "wallet", en: "Wallet & Payments", ar: "المحفظة والمدفوعات", href: "/dashboard/wallet", icon: Wallet },
      { key: "benefits", en: "Coupons & Contracts", ar: "\u0627\u0644\u0645\u0632\u0627\u064a\u0627", href: "/dashboard/benefits", icon: Gift },
      { key: "referral", en: "Referral & Loyalty", ar: "الإحالة والولاء", href: "/dashboard/referral", icon: Gift },
    ],
  },
  {
    en: "Account", ar: "الحساب",
    items: [
      { key: "addresses", en: "Saved Addresses", ar: "\u0627\u0644\u0639\u0646\u0627\u0648\u064a\u0646 \u0627\u0644\u0645\u062d\u0641\u0648\u0638\u0629", href: "/dashboard/addresses", icon: Home },
      { key: "profile", en: "My Profile", ar: "ملفي الشخصي", href: "/dashboard/profile", icon: User },
      { key: "notifications", en: "Notifications", ar: "الإشعارات", href: "/dashboard/notifications", icon: Bell },
      { key: "complaints", en: "Complaints", ar: "الشكاوى", href: "/dashboard/complaints", icon: AlertCircle },
      { key: "help", en: "Help & FAQ", ar: "المساعدة والأسئلة", href: "/dashboard/help", icon: HelpCircle },
    ],
  },
];

export const allItems = navGroups.flatMap((g) => g.items);

// the 4 tabs on mobile bottom bar (+ Book button + More)
export const bottomKeys = ["overview", "appointments", "messages"];