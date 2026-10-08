export const copy = {
  en: {
    title: "Notifications",
    subtitle: "Updates about your appointments, payments and requests.",
    markAll: "Mark all as read",
    tabs: { all: "All", unread: "Unread" },
    groups: { today: "Today", yesterday: "Yesterday", earlier: "Earlier" },
    justNow: "Just now",
    empty: {
      all: { title: "No notifications yet", text: "Updates about your care will appear here." },
      unread: { title: "You're all caught up", text: "You have no unread notifications." },
    },
    pager: { prev: "Previous", next: "Next", page: "Page", of: "of" },
  },
  ar: {
    title: "الإشعارات",
    subtitle: "تحديثات حول مواعيدك ومدفوعاتك وطلباتك.",
    markAll: "تحديد الكل كمقروء",
    tabs: { all: "الكل", unread: "غير المقروءة" },
    groups: { today: "اليوم", yesterday: "أمس", earlier: "سابقاً" },
    justNow: "الآن",
    empty: {
      all: { title: "لا توجد إشعارات بعد", text: "ستظهر هنا تحديثات رعايتك الصحية." },
      unread: { title: "لا جديد لديك", text: "ليس لديك إشعارات غير مقروءة." },
    },
    pager: { prev: "السابق", next: "التالي", page: "صفحة", of: "من" },
  },
};

export type Copy = typeof copy.en;