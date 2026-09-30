import { NextResponse } from "next/server";
import { validateContact, type ContactPayload } from "@/lib/contact";

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Spam trap: real visitors never fill this hidden field.
  if (body.website) return NextResponse.json({ ok: true });

  const fieldErrors = validateContact({
    firstName: body.firstName ?? "",
    lastName: body.lastName ?? "",
    phone: body.phone ?? "",
    email: body.email ?? "",
    message: body.message ?? "",
  });

  if (Object.keys(fieldErrors).length > 0) {
    return NextResponse.json({ error: "Please check the highlighted fields.", fieldErrors }, { status: 422 });
  }

  // TODO (backend developer): connect the real backend here.
  // Available fields: body.firstName, body.lastName, body.phone, body.email, body.message
  // Examples: send an email, save to a database, or forward to your existing API.

  return NextResponse.json({ ok: true });
}