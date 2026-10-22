import "server-only";
import { requireSession } from "@/lib/auth/session";
import { unavailableRead } from "@/lib/api/features";
import type {
  ComplaintDetail,
  ComplaintFilters,
  ComplaintInput,
  ComplaintsResult,
  CreateResult,
  ServiceResult,
} from "./types";
export const PAGE_SIZE = 6;
export async function getComplaints(
  filters: ComplaintFilters,
  locale: string,
): Promise<ComplaintsResult> {
  void filters;
  void locale;
  return unavailableRead("complaints");
}
export async function getComplaint(
  id: string,
  locale: string,
): Promise<ComplaintDetail | null> {
  void id;
  void locale;
  return unavailableRead("complaints");
}
export async function createComplaint(
  input: ComplaintInput,
): Promise<CreateResult> {
  void input;
  await requireSession();
  return { ok: false, code: "generic" };
}
export async function addReply(
  id: string,
  message: string,
): Promise<ServiceResult> {
  void id;
  void message;
  await requireSession();
  return { ok: false, code: "generic" };
}
