"use server";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import {
  source,
  request,
  numeric,
  uuid,
  text,
  date,
  addressBody,
  serviceBody,
  reviewBody,
} from "@/lib/api/patient-dashboard";
export type Result = { ok: boolean; message?: string; uncertain?: boolean };
export async function mutate(_previous: Result, fd: FormData): Promise<Result> {
  await requireSession();
  let sent = false,
    unsafe = false;
  try {
    const s = source(fd.get("source")),
      op = String(fd.get("op"));
    let result: unknown;
    if (op === "favorite-add" || op === "favorite-remove") {
      const id = numeric(fd.get("id"));
      sent = true;
      result = (
        await request(
          s,
          (s === "d4h" ? "/favorites/providers/" : "/favorites/consultants/") +
            id,
          { method: op === "favorite-add" ? "PUT" : "DELETE" },
        )
      ).data;
    } else if (op === "review") {
      const body = reviewBody(fd.get("rating"), fd.get("comment")),
        id = numeric(fd.get("id"));
      sent = true;
      result = (
        await request(
          s,
          (s === "d4h" ? "/bookings/" : "/appointments/") + id + "/review",
          { method: "PUT", body },
        )
      ).data;
    } else if (op === "complaint") {
      const booking = fd.get("booking_id"),
        body = {
          subject: text(fd.get("subject"), 150),
          message: text(fd.get("message"), 5000),
          ...(booking ? { booking_id: numeric(booking) } : {}),
        };
      unsafe = true;
      sent = true;
      result = (await request(s, "/complaints", { method: "POST", body })).data;
    } else if (op === "request") {
      if (s !== "d4h") throw Error("Choose the home-visit account.");
      const body = serviceBody(fd);
      unsafe = true;
      sent = true;
      result = (await request(s, "/service-requests", { method: "POST", body }))
        .data;
    } else if (op === "address-create" || op === "address-edit") {
      if (s !== "d4h") throw Error("Choose the home-visit account.");
      const body = addressBody(fd),
        id = op === "address-edit" ? numeric(fd.get("id")) : null;
      unsafe = !id;
      sent = true;
      result = (
        await request(s, "/patients/addresses" + (id ? "/" + id : ""), {
          method: id ? "PATCH" : "POST",
          body,
        })
      ).data;
    } else if (op === "address-delete") {
      if (s !== "d4h") throw Error("Choose the home-visit account.");
      const id = numeric(fd.get("id"));
      sent = true;
      result = (
        await request(s, "/patients/addresses/" + id, { method: "DELETE" })
      ).data;
    } else if (op === "document-delete") {
      const id = uuid(fd.get("id"));
      sent = true;
      result = (
        await request(s, "/patient-documents/" + id, { method: "DELETE" })
      ).data;
    } else if (op === "document-upload") {
      const body = new FormData();
      body.set("title", text(fd.get("title"), 150));
      const category = text(fd.get("category"), 20);
      if (!["lab_result", "xray", "other"].includes(category))
        throw Error("Invalid category.");
      body.set("category", category);
      if (fd.get("booking_id"))
        body.set("booking_id", String(numeric(fd.get("booking_id"))));
      const files = fd.getAll("files[]");
      if (files.length < 1 || files.length > 5)
        throw Error("Choose 1 to 5 PDF files.");
      if(process.env.VERCEL&&files.reduce((n,f)=>n+(f instanceof File?f.size:0),0)>4000000)throw Error("Choose files totalling no more than 4 MB on this site.");
      for (const f of files) {
        if (
          !(f instanceof File) ||
          f.size < 1 ||
          f.size > 10 * 1024 * 1024 ||
          f.type !== "application/pdf"
        )
          throw Error("Only PDF files up to 10 MB are accepted.");
        const signature = new Uint8Array(await f.slice(0, 5).arrayBuffer());
        if (new TextDecoder().decode(signature) !== "%PDF-")
          throw Error("Invalid PDF file.");
        body.append("files[]", f);
      }
      unsafe = true;
      sent = true;
      result = (
        await request(s, "/patient-documents", { method: "POST", body })
      ).data;
    } else if (op === "referral-validate") {
      if (s !== "d4h") throw Error("Choose the home-visit account.");
      const code = text(fd.get("referral_code"), 150);
      sent = true;
      const r = await request<{
        valid: boolean;
        applies_at_signup_only?: boolean;
      }>(s, "/referrals/validate", {
        method: "POST",
        body: { referral_code: code },
      });
      return {
        ok: true,
        message: r.data.valid
          ? "This referral code is valid for signup only. No points have been awarded."
          : "This referral code is not valid.",
      };
    } else if (op === "profile") {
      if (s !== "zuwara") throw Error("Invalid profile account.");
      const full_name = text(fd.get("full_name"), 150),
        email = text(fd.get("email"), 190, false);
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw Error("Invalid email.");
      const gender = String(fd.get("gender") ?? "");
      if (!["", "0", "1"].includes(gender)) throw Error("Invalid gender.");
      const body = {
        full_name,
        full_name_ar: text(fd.get("full_name_ar"), 150, false) || null,
        email: email || null,
        city: text(fd.get("city"), 150, false) || null,
        national_id: text(fd.get("national_id"), 20, false) || null,
        date_of_birth: date(fd.get("date_of_birth")),
        gender: gender === "" ? null : Number(gender),
      };
      sent = true;
      result = (await request(s, "/patients/me", { method: "PATCH", body }))
        .data;
    } else if (op === "avatar") {
      if (s !== "zuwara") throw Error("Invalid profile account.");
      const f = fd.get("image");
      if (
        !(f instanceof File) ||
        f.size < 1 ||
        f.size > 2 * 1024 * 1024 ||
        !["image/jpeg", "image/png", "image/webp"].includes(f.type)
      )
        throw Error("Choose a JPEG, PNG or WebP image up to 2 MB.");
      const body = new FormData();
      body.set("image", f);
      unsafe = true;
      sent = true;
      result = (
        await request(s, "/patients/me/avatar", { method: "POST", body })
      ).data;
    } else throw Error("Unsupported action.");
    void result;
    revalidatePath("/", "layout");
    return { ok: true, message: "Saved successfully." };
  } catch (error) {
    unstable_rethrow(error);
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : 0;
    const uncertain = sent && unsafe && (!status || status >= 500);
    const code =
      typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : "";
    return {
      ok: false,
      uncertain,
      message: uncertain
        ? "The outcome is unknown. Check the list before submitting again."
        : code === "ALREADY_REVIEWED"
          ? "This appointment or visit already has a review."
          : code === "REVIEW_NOT_ALLOWED"
            ? "Only completed appointments or visits can be reviewed."
            : !sent && error instanceof Error
              ? error.message
              : status === 422
                ? "Please check your entries. The server rejected one or more values."
                : status === 429
                  ? "Too many requests. Please wait before retrying."
                  : "The request could not be completed. Please try again later.",
    };
  }
}
