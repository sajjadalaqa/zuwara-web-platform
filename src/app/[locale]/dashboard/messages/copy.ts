export const copy = {
  en: {
    title: "Messages",
    search: "Search conversations",
    clear: "Clear search",
    you: "You:",
    today: "Today",
    yesterday: "Yesterday",
    noMatch: "No conversations match your search.",
    empty: {
      title: "No conversations yet",
      text: "When you message a provider, your conversations will appear here.",
      cta: "Find a provider",
    },
    select: {
      title: "Your messages",
      text: "Select a conversation to start chatting.",
    },
    chat: {
      back: "Back to messages",
      book: "Book",
      noMessages: "No messages yet. Say hello!",
      placeholder: "Write a message...",
      send: "Send message",
    },
    errors: {
      required: "Please write a message.",
      too_long: "Your message is too long (max 1,000 characters).",
      not_found: "This conversation no longer exists.",
      generic: "Couldn't send your message. Please try again.",
    },
    notFound: {
      title: "Conversation not found",
      text: "It may have been removed, or the link is incorrect.",
      back: "Back to messages",
    },
  },
  ar: {
    title: "الرسائل",
    search: "ابحث في المحادثات",
    clear: "مسح البحث",
    you: "أنت:",
    today: "اليوم",
    yesterday: "أمس",
    noMatch: "لا توجد محادثات مطابقة لبحثك.",
    empty: {
      title: "لا توجد محادثات بعد",
      text: "عندما تراسل أحد المزودين ستظهر محادثاتك هنا.",
      cta: "ابحث عن مزود",
    },
    select: {
      title: "رسائلك",
      text: "اختر محادثة لبدء الدردشة.",
    },
    chat: {
      back: "العودة إلى الرسائل",
      book: "احجز",
      noMessages: "لا توجد رسائل بعد. ابدأ بالتحية!",
      placeholder: "اكتب رسالة...",
      send: "إرسال الرسالة",
    },
    errors: {
      required: "يرجى كتابة رسالة.",
      too_long: "رسالتك طويلة جداً (الحد الأقصى 1,000 حرف).",
      not_found: "هذه المحادثة لم تعد موجودة.",
      generic: "تعذّر إرسال رسالتك. يرجى المحاولة مرة أخرى.",
    },
    notFound: {
      title: "المحادثة غير موجودة",
      text: "ربما تمت إزالتها، أو أن الرابط غير صحيح.",
      back: "العودة إلى الرسائل",
    },
  },
};

export type Copy = typeof copy.en;