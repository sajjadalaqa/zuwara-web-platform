import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(path, transform = source => source) {
  const source = (await readFile(new URL(path, import.meta.url), "utf8")).replace('import "server-only";', "");
  const { outputText } = ts.transpileModule(transform(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { d4hV2, D4hV2Error } = await load("../src/lib/api/d4h/v2.ts");
test("D4H requests use the visit host and never attach credentials to public requests", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.D4H_V2_API_BASE_URL;
  delete process.env.D4H_V2_API_BASE_URL;
  try {
    let received;
    globalThis.fetch = async (url, init) => { received = { url, init }; return Response.json({ success: true, data: [] }); };
    await d4hV2("/providers?per_page=50", { locale: "ar" });
    assert.equal(received.url, "https://dashboardvisit.zuwara.sa/api/platform/v2/providers?per_page=50");
    assert.equal(received.init.headers.Authorization, undefined);
    assert.equal(received.init.headers.lang, "ar");
    assert.equal(received.init.cache, "no-store");
    assert.equal(received.init.redirect, "error");
    await d4hV2("/patients/addresses", { token: "d4h-only" });
    assert.equal(received.init.headers.Authorization, "Bearer d4h-only");
    globalThis.fetch = async () => Response.json({ success: false, error: { code: "API_V2_DISABLED" }, meta: { request_id: "d4h-request" } }, { status: 503 });
    await assert.rejects(d4hV2("/providers"), error => error instanceof D4hV2Error && error.status === 503 && error.requestId === "d4h-request");
    await assert.rejects(d4hV2("//untrusted.example"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.D4H_V2_API_BASE_URL; else process.env.D4H_V2_API_BASE_URL = originalBase;
  }
});
test("provider pagination keeps real IDs, discards private fields, and distinguishes missing records from outages", async () => {
  const oldHarness = globalThis.__d4hProviderTest;
  const calls = [];
  globalThis.__d4hProviderTest = {
    cache: callback => callback, D4hV2Error,
    d4hV2: async path => {
      calls.push(path);
      if (path.includes("page=1")) return { success: true, data: [{ id: 6, name: "Andrew", email: "private@example.test", rating: 5 }], meta: { pagination: { has_more: true } } };
      if (path.includes("page=2")) return { success: true, data: [{ id: 6, name: "Andrew" }, { id: 60, name: "Ruth" }], meta: { pagination: { has_more: false } } };
      if (path === "/providers/60") return { success: true, data: { id: 60, name: "Ruth", bank_account: "private", rating: 0, rating_count: 0, biography: "Public biography", photo: "https://dashboardvisit.zuwara.sa/images/user/user.png" } };
      if (path === "/providers/999") throw new D4hV2Error(404);
      throw new D4hV2Error(503);
    },
  };
  try {
    const api = await load("../src/lib/api/d4h/providers.ts", source => `const {cache,d4hV2,D4hV2Error} = globalThis.__d4hProviderTest;\n${source.replace(/^import .*;\r?$/gm, "")}`);
    assert.deepEqual(await api.getD4hProviders("en"), [{ id: 6, name: "Andrew", rating: 5 }, { id: 60, name: "Ruth" }]);
    assert.deepEqual(await api.getD4hProvider("60", "ar"), { id: 60, name: "Ruth", rating: 0, reviewsCount: 0, bio: "Public biography", image: "https://dashboardvisit.zuwara.sa/images/user/user.png" });
    assert.equal(await api.getD4hProvider("999", "en"), null);
    const count = calls.length;
    assert.equal(await api.getD4hProvider("not-an-id", "en"), null);
    assert.equal(calls.length, count);
    await assert.rejects(api.getD4hProvider("7", "en"), error => error.status === 503);
  } finally { globalThis.__d4hProviderTest = oldHarness; }
});
test("private D4H requests always use the linked D4H token and stop when the connection is unavailable", async () => {
  const oldHarness = globalThis.__d4hPatientTest;
  let connected = true;
  let received;
  globalThis.__d4hPatientTest = {
    getLocale: async () => "ar", requireSession: async () => ({ session: { access_token: "zuwara-only" } }),
    readD4hSession: async () => connected ? { access_token: "d4h-only" } : null,
    D4hV2Error, d4hV2: async (path, options) => { received = { path, options }; return { data: [] }; },
  };
  try {
    const api = await load("../src/lib/api/d4h/patient.ts", source => `const {getLocale,requireSession,readD4hSession,D4hV2Error,d4hV2} = globalThis.__d4hPatientTest;\n${source.replace(/^import .*;\r?$/gm, "")}`);
    await api.d4hPatientApi("/patients/addresses", { token: "zuwara-only" });
    assert.equal(received.options.token, "d4h-only");
    assert.equal(received.options.locale, "ar");
    received = null; connected = false;
    await assert.rejects(api.d4hPatientApi("/patients/addresses"), error => error.code === "D4H_SESSION_UNAVAILABLE");
    assert.equal(received, null);
  } finally { globalThis.__d4hPatientTest = oldHarness; }
});