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
      { key: "records", en: "Medical Records", ar: "السجلات الطبية", href: "/dashboard/records", icon: FileText },
      { key: "reviews", en: "Reviews", ar: "التقييمات", href: "/dashboard/reviews", icon: Star },
    ],
  },
  {
    en: "Payments", ar: "المدفوعات",
    items: [
      { key: "wallet", en: "Wallet & Payments", ar: "المحفظة والمدفوعات", href: "/dashboard/wallet", icon: Wallet },
      { key: "referral", en: "Referral & Loyalty", ar: "الإحالة والولاء", href: "/dashboard/referral", icon: Gift },
    ],
  },
  {
    en: "Account", ar: "الحساب",
    items: [
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