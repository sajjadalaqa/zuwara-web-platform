import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function loadTypeScript(path, transform = source => source) {
  const source = (await readFile(new URL(path, import.meta.url), "utf8")).replace('import "server-only";', "");
  const { outputText } = ts.transpileModule(transform(source), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { seal, unseal } = await loadTypeScript("../src/lib/auth/seal.ts");
const secret = "a-test-secret-that-is-longer-than-thirty-two-characters";
test("session cookies hide tokens and reject tampering, wrong keys, and wrong purposes", () => {
  const data = { session: { access_token: "private-access", refresh_token: "private-refresh" } };
  const encoded = seal(data, secret, "zuwara_session");
  assert.equal(encoded.includes("private-access"), false);
  assert.deepEqual(unseal(encoded, secret, "zuwara_session"), data);
  assert.equal(unseal(encoded, `${secret}different`, "zuwara_session"), null);
  assert.equal(unseal(encoded, secret, "zuwara_otp"), null);
  const packed = Buffer.from(encoded, "base64url"); packed[30] ^= 1;
  assert.equal(unseal(packed.toString("base64url"), secret, "zuwara_session"), null);
  assert.equal(unseal("invalid", secret, "zuwara_session"), null);
  assert.notEqual(encoded, seal(data, secret, "zuwara_session"));
  assert.throws(() => seal(data, "short", "zuwara_session"));
});
const { zuwaraV2 } = await loadTypeScript("../src/lib/api/zuwara/v2.ts");

test("booking validation retains rejected field names without exposing submitted values or backend messages", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => Response.json({
      success: false,
      error: { code: "VALIDATION_FAILED", message: "Private symptom text", details: { errors: { consultation_type: ["Private rejected value"], time: ["Private appointment detail"] } } },
      meta: { request_id: "validation-reference" },
    }, { status: 422 });
    await assert.rejects(zuwaraV2("/appointments/preview", { method: "POST", body: {} }), error => {
      assert.equal(error.code, "VALIDATION_FAILED");
      assert.equal(error.requestId, "validation-reference");
      assert.deepEqual(error.validationFields, ["consultation_type", "time"]);
      assert.equal(JSON.stringify(error).includes("Private"), false);
      assert.equal(error.message.includes("Private"), false);
      return true;
    });
  } finally { globalThis.fetch = originalFetch; }
});
test("BFF requests keep tokens in headers, disable caching and redirects, and retain error identifiers", async () => {
  const originalFetch = globalThis.fetch;
  const originalBase = process.env.ZUWARA_V2_API_BASE_URL;
  process.env.ZUWARA_V2_API_BASE_URL = "https://backend.example/api/platform/v2";
  try {
    let received;
    globalThis.fetch = async (url, init) => {
      received = { url, init };
      return Response.json({ success: true, message: "OK", data: { id: 1 } });
    };
    await zuwaraV2("/auth/me", { token: "server-secret", locale: "ar" });
    assert.equal(received.url, "https://backend.example/api/platform/v2/auth/me");
    assert.equal(received.url.includes("server-secret"), false);
    assert.equal(received.init.headers.Authorization, "Bearer server-secret");
    assert.equal(received.init.headers.lang, "ar");
    assert.equal(received.init.cache, "no-store");
    assert.equal(received.init.redirect, "error");
    assert.ok(received.init.headers["X-Request-ID"]);
    globalThis.fetch = async () => Response.json({ success: false, error: { code: "OTP_INVALID", message: "Sensitive backend detail" }, meta: { request_id: "request-123" } }, { status: 422 });
    await assert.rejects(zuwaraV2("/auth/otp/verify", { method: "POST", body: { otp: "000000" } }), error =>
      error.code === "OTP_INVALID" && error.status === 422 && error.requestId === "request-123" && !error.message.includes("Sensitive"));
    await assert.rejects(zuwaraV2("//other.example"));
    await assert.rejects(zuwaraV2("/../auth/me"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalBase === undefined) delete process.env.ZUWARA_V2_API_BASE_URL; else process.env.ZUWARA_V2_API_BASE_URL = originalBase;
  }
});
test("OTP actions verify only the server-held challenge, preserve refresh sessions on failure, and revoke on logout", async () => {
  const oldHarness = globalThis.__zuwaraAuthTest;
  let pending = null;
  let session = null;
  const calls = [];
  class ApiError extends Error { constructor(status, code) { super(code); this.status = status; this.code = code; } }
  let failRefresh = false;
  const issued = { user: { id: "patient-1" }, session: { access_token: "access-1", refresh_token: "refresh-1", access_expires_at: new Date(Date.now() + 3600000).toISOString(), refresh_expires_at: new Date(Date.now() + 86400000).toISOString() } };
  globalThis.__zuwaraAuthTest = {
    getLocale: async () => "en", ZuwaraV2Error: ApiError,
    clearPending: async () => { pending = null; }, clearSession: async () => { session = null; },
    readPending: async () => pending, readSession: async () => session,
    savePending: async value => { pending = value; }, saveSession: async value => { session = value; },
    zuwaraV2: async (path, options) => {
      calls.push({ path, options });
      if (path === "/auth/otp/request") return { data: { challenge_id: "server-challenge", expires_in: 120, resend_after: 60 } };
      if (path === "/auth/otp/verify") {
        assert.equal(options.body.challenge_id, "server-challenge");
        if (options.body.otp !== "123456") throw new ApiError(422, "OTP_INVALID");
        return { data: issued };
      }
      if (path === "/auth/refresh") {
        assert.equal(options.token, "refresh-1");
        if (failRefresh) throw new ApiError(503, "API_UNAVAILABLE");
        return { data: { ...issued, session: { ...issued.session, access_token: "access-2", refresh_token: "refresh-2" } } };
      }
      if (path === "/auth/session") { assert.equal(options.token, "access-2"); return { data: {} }; }
      throw new Error("Unexpected endpoint");
    },
  };
  try {
    const actions = await loadTypeScript("../src/lib/auth/actions.ts", source => {
      const stripped = source.replace(/^import .*;\r?$/gm, "");
      return `const {getLocale,zuwaraV2,ZuwaraV2Error,clearPending,clearSession,readPending,readSession,savePending,saveSession} = globalThis.__zuwaraAuthTest;\n${stripped}`;
    });
    assert.equal((await actions.verifyOtpAction("123456")).ok, false);
    assert.equal(calls.length, 0);
    const result = await actions.requestOtpAction({ intent: "login", country_code: "+966", phone_number: "555434123", access_token: "ignored" });
    assert.equal(result.ok, true);
    assert.equal(JSON.stringify(result).includes("server-challenge"), false);
    assert.equal(calls[0].options.body.access_token, undefined);
    assert.equal((await actions.resendOtpAction()).ok, false);
    assert.equal((await actions.verifyOtpAction("000000")).ok, false);
    assert.equal(session, null);
    assert.equal((await actions.verifyOtpAction("123456")).ok, true);
    assert.equal(pending, null);
    assert.equal(session.session.access_token, "access-1");
    assert.equal((await actions.refreshSessionAction()).ok, true);
    assert.equal(calls.filter(call => call.path === "/auth/refresh").length, 0);
    session = { ...session, session: { ...session.session, access_expires_at: new Date(Date.now() - 1000).toISOString() } };
    failRefresh = true;
    assert.equal((await actions.refreshSessionAction()).ok, false);
    assert.equal(session.session.refresh_token, "refresh-1");
    failRefresh = false;
    assert.equal((await actions.refreshSessionAction()).ok, true);
    assert.equal(session.session.refresh_token, "refresh-2");
    assert.equal((await actions.logoutAction()).ok, true);
    assert.equal(session, null);
    assert.equal(JSON.stringify(result).includes("access-1"), false);
  } finally { globalThis.__zuwaraAuthTest = oldHarness; }
});
test("session cookies isolate backend credentials, bind D4H identity, and reject expired or tampered sessions", async () => {
  const oldHarness = globalThis.__zuwaraSessionTest;
  const oldSecret = process.env.NEXT_SERVER_SESSION_SECRET;
  process.env.NEXT_SERVER_SESSION_SECRET = secret;
  const jar = new Map();
  class Redirect extends Error { constructor(destination) { super(destination); this.destination = destination; } }
  globalThis.__zuwaraSessionTest = {
    cookies: async () => ({ get: name => jar.get(name), set: (name, value, options) => jar.set(name, { value, options }), delete: name => jar.delete(name) }),
    getLocale: async () => "ar", redirect: destination => { throw new Redirect(destination); },
    seal, unseal, zuwaraV2: async () => { throw new Error("Unexpected request"); }, ZuwaraV2Error: Error,
  };
  try {
    const sessionApi = await loadTypeScript("../src/lib/auth/session.ts", source => {
      const stripped = source.replace(/^import .*;\r?$/gm, "");
      return `const {cookies,getLocale,redirect,seal,unseal,zuwaraV2,ZuwaraV2Error} = globalThis.__zuwaraSessionTest;\n${stripped}`;
    });
    await assert.rejects(sessionApi.requireSession(), error => error.destination === "/ar/login-page");
    const data = { user: { id: "patient-1", full_name: "Patient" }, session: {
      access_token: "private-access", refresh_token: "private-refresh",
      access_expires_at: new Date(Date.now() + 3600000).toISOString(), refresh_expires_at: new Date(Date.now() + 86400000).toISOString(),
    }, connections: { d4h: { available: true, session: { user_id: 812, access_token: "linked-d4h-token", expires_at: new Date(Date.now() + 3600000).toISOString() } } } };
    await sessionApi.saveSession(data);
    const cookie = jar.get("zuwara_session");
    assert.equal(cookie.options.httpOnly, true);
    assert.equal(cookie.options.sameSite, "lax");
    assert.equal(cookie.options.path, "/");
    const decoded = unseal(cookie.value, secret, "zuwara_session");
    assert.equal(decoded.connections, undefined);
    const linkedCookie = jar.get("zuwara_d4h_session");
    assert.equal(linkedCookie.options.httpOnly, true);
    assert.equal(linkedCookie.value.includes("linked-d4h-token"), false);
    const linkedDecoded = unseal(linkedCookie.value, secret, "zuwara_d4h_session");
    assert.equal(linkedDecoded.access_token, "linked-d4h-token");
    assert.equal(linkedDecoded.refresh_token, undefined);
    assert.equal((await sessionApi.readD4hSession()).user_id, 812);
    jar.set("zuwara_d4h_session", { value: seal({ ...linkedDecoded, identity: "other-patient" }, secret, "zuwara_d4h_session") });
    assert.equal(await sessionApi.readD4hSession(), null);
    await sessionApi.saveSession(data);
    await sessionApi.saveSession({ ...data, connections: { d4h: { available: false } } });
    assert.equal(jar.has("zuwara_d4h_session"), false);
    assert.equal((await sessionApi.readSession()).user.id, "patient-1");
    await sessionApi.saveSession(data);
    assert.equal((await sessionApi.requireSession()).user.id, "patient-1");
    const expiredAccess = { ...data, session: { ...data.session, access_expires_at: new Date(Date.now() - 1000).toISOString() } };
    jar.set("zuwara_session", { value: seal(expiredAccess, secret, "zuwara_session") });
    await assert.rejects(sessionApi.requireSession(), error => error.destination === "/ar/session-refresh-page");
    jar.set("zuwara_session", { value: "tampered" });
    assert.equal(await sessionApi.readSession(), null);
    await assert.rejects(sessionApi.saveSession(expiredAccess));
    await sessionApi.clearSession();
    assert.equal(jar.has("zuwara_session"), false);
    assert.equal(jar.has("zuwara_d4h_session"), false);
  } finally {
    globalThis.__zuwaraSessionTest = oldHarness;
    if (oldSecret === undefined) delete process.env.NEXT_SERVER_SESSION_SECRET; else process.env.NEXT_SERVER_SESSION_SECRET = oldSecret;
  }
});
