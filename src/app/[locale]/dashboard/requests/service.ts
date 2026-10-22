import "server-only";
import { requireSession } from "@/lib/auth/session";
import { unavailableRead } from "@/lib/api/features";
import type {
  ActionResult,
  CreateResult,
  RequestDetail,
  RequestFilters,
  RequestInput,
  RequestsResult,
  StatusFilter,
} from "./types";
export const PAGE_SIZE = 6;
export async function getRequests(
  filters: RequestFilters,
  locale: string,
): Promise<RequestsResult> {
  void filters;
  void locale;
  return unavailableRead("requests");
}
export async function getRequestCounts(): Promise<
  Record<StatusFilter, number>
> {
  return unavailableRead("requests");
}
export async function getRequest(
  id: string,
  locale: string,
): Promise<RequestDetail | null> {
  void id;
  void locale;
  return unavailableRead("requests");
}
export async function createRequest(
  input: RequestInput,
): Promise<CreateResult> {
  void input;
  await requireSession();
  return { ok: false, code: "generic" };
}
export async function cancelRequest(id: string): Promise<ActionResult> {
  void id;
  await requireSession();
  return { ok: false, error: "generic" };
}
export async function acceptOffer(
  requestId: string,
  offerId: string,
): Promise<ActionResult> {
  void requestId;
  void offerId;
  await requireSession();
  return { ok: false, error: "generic" };
}
