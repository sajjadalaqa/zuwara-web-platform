import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });

  // Spam trap: pretend success so bots learn nothing
  if (body.company) return NextResponse.json({ ok: true });

  const { firstName, lastName, email, phone, message } = body as Record<string, string>;
  const valid =
    firstName?.trim() && lastName?.trim() && phone?.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? "") &&
    (message?.trim().length ?? 0) >= 10;
  if (!valid) return NextResponse.json({ ok: false }, { status: 422 });

  // TODO: send the email here (Resend, Nodemailer, SendGrid, etc.) or save to your database.

  return NextResponse.json({ ok: true });
}