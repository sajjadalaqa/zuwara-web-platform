import { getRecordFile } from "../../service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ locale: string; id: string }> }
) {
  // TODO (backend): check the session here. Return 401 if signed out, and 404 if the
  // record doesn't belong to the signed-in user (so ids can't be guessed).
  const { id } = await params;
  const download = new URL(req.url).searchParams.get("download") === "1";

  const file = await getRecordFile(id);
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.body, {
    headers: {
      "Content-Type": file.type,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}