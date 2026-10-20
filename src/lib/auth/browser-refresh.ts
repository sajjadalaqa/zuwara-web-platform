"use client";
import { refreshSessionAction } from "./actions";
// Serialize refreshes across same-origin tabs so a rotated token is not reused.
export async function refreshBrowserSession() {
  if (navigator.locks) return navigator.locks.request("zuwara-session-refresh", () => refreshSessionAction());
  return refreshSessionAction();
}