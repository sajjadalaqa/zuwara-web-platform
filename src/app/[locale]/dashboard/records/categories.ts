import { FileText, FlaskConical, FolderOpen, Pill, ScanLine, Syringe } from "lucide-react";
import type { RecordCategory } from "./types";

export const categoryIcon = {
  lab: FlaskConical,
  imaging: ScanLine,
  prescription: Pill,
  report: FileText,
  vaccination: Syringe,
  other: FolderOpen,
} satisfies Record<RecordCategory, unknown>;