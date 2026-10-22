import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
let serial = 0;
async function load(path, bindings) {
  globalThis.__remainingHarness = bindings;
  const source = (
    await readFile(new URL("../" + path, import.meta.url), "utf8")
  )
    .replace(/^\uFEFF/, "")
    .replace(/^import[\s\S]*?;\r?$/gm, "");
  const code = ts.transpileModule(
    "const {" +
      Object.keys(bindings).join(",") +
      "}=globalThis.__remainingHarness;\n" +
      source +
      "\n//" +
      serial++,
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  return import(
    "data:text/javascript;base64," + Buffer.from(code).toString("base64")
  );
}
test("messages index uses owned appointments without invented unread or previews", async () => {
  let historyCalls = 0;
  const row = (id, code, date) => ({
    id,
    appointment_number: "APT-" + id,
    doctor: { id: 9, name: "Provider" },
    status: { code, key: "confirmed" },
    created_at: date,
    date,
  });
  const api = await load("src/app/[locale]/dashboard/messages/service.ts", {
    allAppointments: async () => [
      row(1, 1, "2026-10-01"),
      row(2, 7, "2026-10-02"),
      row(3, 1, "2026-10-03"),
    ],
    startsAt: (r) => r.date,
    requireSession: async () => ({}),
    chatHistory: async () => {
      historyCalls++;
      return { messages: [], canSend: false, nextCursor: null };
    },
  });
  const items = await api.getConversations("en");
  assert.deepEqual(
    items.map((i) => i.id),
    ["3", "1"],
  );
  assert.equal(items[0].lastMessage, null);
  assert.equal(items[0].unreadCount, null);
  assert.equal(historyCalls, 0);
  assert.equal(await api.getConversation("2", "en"), null);
  assert.equal(await api.getConversation("999", "en"), null);
  assert.equal(historyCalls, 0);
  assert.equal((await api.getConversation("1", "en")).canSend, false);
  assert.equal(historyCalls, 1);
});
test("unsupported writes never report success and reject unsigned callers", async () => {
  let signedIn = true,
    calls = 0;
  const requireSession = async () => {
    calls++;
    if (!signedIn) throw Error("unauthorized");
    return {};
  };
  const cases = {
    saved: ["removeSaved"],
    reviews: ["saveReview", "deleteReview"],
    complaints: ["createComplaint", "addReply"],
    referral: ["redeemPoints"],
    requests: ["createRequest", "cancelRequest", "acceptOffer"],
    messages: ["sendMessage", "markConversationRead"],
  };
  for (const [feature, methods] of Object.entries(cases)) {
    const api = await load(
      "src/app/[locale]/dashboard/" + feature + "/service.ts",
      {
        requireSession,
        unavailableRead: async () => {
          throw Error("unavailable");
        },
        patientApi: async () => ({
          data: { summary: { favorite_consultants: 0 } },
        }),
      },
    );
    for (const method of methods) {
      signedIn = true;
      assert.equal((await api[method]("1", "text")).ok, false);
      signedIn = false;
      await assert.rejects(() => api[method]("1", "text"), /unauthorized/);
    }
  }
  assert.ok(calls > 0);
});
test("saved-provider summary preserves actual zero and rejects malformed counts", async () => {
  let count = 0;
  const api = await load("src/app/[locale]/dashboard/saved/service.ts", {
    requireSession: async () => ({}),
    unavailableRead: async () => {
      throw Error("unavailable");
    },
    patientApi: async () => ({
      data: { summary: { favorite_consultants: count } },
    }),
  });
  assert.equal(await api.getSavedCount(), 0);
  count = 4;
  assert.equal(await api.getSavedCount(), 4);
  count = -1;
  await assert.rejects(() => api.getSavedCount());
});
