import { Brain, FlaskConical, HeartHandshake, Pill, Stethoscope, Syringe } from "lucide-react";
import type { Category } from "./types";

export const categoryIcon = {
  nursing: Stethoscope,
  caregiver: HeartHandshake,
  laboratory: FlaskConical,
  therapy: Brain,
  injection: Syringe,
  pharmacy: Pill,
} satisfies Record<Category, unknown>;