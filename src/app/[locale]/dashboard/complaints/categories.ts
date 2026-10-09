import { CalendarX2, ClipboardList, CreditCard, HelpCircle, Smartphone, UserX } from "lucide-react";
import type { Category } from "./types";

export const categoryIcon = {
  appointment: CalendarX2,
  provider: UserX,
  payment: CreditCard,
  request: ClipboardList,
  app: Smartphone,
  other: HelpCircle,
} satisfies Record<Category, unknown>;