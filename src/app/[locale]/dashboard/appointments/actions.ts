"use server";

import { cancelAppointment } from "./service";
import type { ActionResult } from "./types";

export async function cancelAppointmentAction(id: string): Promise<ActionResult> {
  // TODO (backend): check the session here and make sure this appointment
  // belongs to the signed-in user. Always enforce this on the server.
  return cancelAppointment(id);
}