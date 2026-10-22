import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
let serial = 0;
async function load(path, bindings = {}) {
  globalThis.__patientHarness = bindings;
  const source = (
    await readFile(new URL("../" + path, import.meta.url), "utf8")
  )
    .replace(/^\uFEFF/, "")
    .replace(/^import[\s\S]*?;\r?$/gm, "");
  const output = ts.transpileModule(
    "const {" +
      Object.keys(bindings).join(",") +
      "}=globalThis.__patientHarness;\n" +
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
    "data:text/javascript;base64," + Buffer.from(output).toString("base64")
  );
}
test("patient dashboard validation preserves coordinates and enforces dates, review precision and service bounds", async () => {
  const api = await load("src/lib/api/patient-dashboard.ts");
  const fd = new FormData();
  fd.set("address", "Home");
  fd.set("lat", "0");
  fd.set("long", "0");
  assert.deepEqual(api.addressBody(fd), { address: "Home", lat: 0, long: 0 });
  fd.set("long", "181");
  assert.throws(() => api.addressBody(fd));
  assert.throws(() => api.date("2026-02-30"));
  assert.throws(() => api.reviewBody(4.123, "Test"));
  assert.deepEqual(api.reviewBody(4.5, " Helpful "), {
    rating: 4.5,
    comment: "Helpful",
  });
  const request = new FormData();
  request.set("title", "Assistance");
  request.set("description", "Details");
  request.append("service_ids", "10");
  request.append("service_ids", "10");
  assert.deepEqual(api.serviceBody(request).service_ids, [10]);
  request.set("preferred_date", "2000-01-01");
  assert.throws(() => api.serviceBody(request));
});
test("new operations select backend credentials, preserve multipart bodies and support PATCH", async () => {
  const calls = [];
  const api = await load("src/lib/api/patient-dashboard.ts", {
    patientApi: async (...args) => {
      calls.push(["zuwara", ...args]);
      return { data: {} };
    },
    d4hPatientApi: async (...args) => {
      calls.push(["d4h", ...args]);
      return { data: {} };
    },
  });
  const body = new FormData();
  body.set("image", new Blob(["test"], { type: "image/png" }), "avatar.png");
  await api.request("zuwara", "/patients/me/avatar", { method: "POST", body });
  await api.request("d4h", "/patients/addresses/1", {
    method: "PATCH",
    body: { address: "Home", lat: 0, long: 0 },
  });
  assert.equal(calls[0][0], "zuwara");
  assert.equal(calls[0][2].body, body);
  assert.equal(calls[1][0], "d4h");
  assert.equal(calls[1][2].method, "PATCH");
});
test("uncertain non-idempotent submissions cannot claim success; uploads fail validation before API calls", async () => {
  let sent = 0;
  const api = await load("src/lib/api/patient-dashboard.ts");
  const actions = await load("src/app/[locale]/dashboard/_patient/actions.ts", {
    ...api,
    requireSession: async () => ({}),
    unstable_rethrow: () => {},
    revalidatePath: () => {},
    request: async () => {
      sent++;
      throw Error("Timeout");
    },
  });
  const fd = new FormData();
  fd.set("source", "zuwara");
  fd.set("op", "complaint");
  fd.set("subject", "Concern");
  fd.set("message", "Details");
  const result = await actions.mutate({ ok: false }, fd);
  assert.equal(result.ok, false);
  assert.equal(result.uncertain, true);
  assert.equal(sent, 1);
  fd.set("op", "document-upload");
  fd.set("title", "Result");
  fd.set("category", "lab_result");
  fd.append(
    "files[]",
    new Blob(["not-pdf"], { type: "application/pdf" }),
    "result.pdf",
  );
  const invalid = await actions.mutate({ ok: false }, fd);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.uncertain, false);
  assert.equal(sent, 1);
});
test("patient document downloads authenticate before network access", async () => {
  let fetched = false;
  const route = await load(
    "src/app/[locale]/dashboard/documents/[id]/file/route.ts",
    {
      randomUUID: () => "",
      readSession: async () => null,
      readD4hSession: async () => null,
      fetch: async () => {
        fetched = true;
      },
    },
  );
  const response = await route.GET(
    new Request(
      "https://example.test/dashboard/documents/invalid/file?source=zuwara",
    ),
    { params: Promise.resolve({ id: "invalid", locale: "en" }) },
  );
  assert.equal(response.status, 401);
  assert.equal(fetched, false);
});

test("V2 transport leaves multipart boundaries to fetch and serializes PATCH as JSON",async()=>{
const calls=[];const api=await load("src/lib/api/zuwara/v2.ts",{randomUUID:()=>"test-request",fetch:async(url,init)=>{calls.push({url,init});return Response.json({success:true,data:{}})}});const form=new FormData();form.set("image",new Blob(["image"],{type:"image/png"}),"avatar.png");await api.zuwaraV2("/patients/me/avatar",{method:"POST",body:form,token:"server-only"});assert.equal(calls[0].init.body,form);assert.equal(calls[0].init.headers["Content-Type"],undefined);assert.equal(calls[0].init.headers.Authorization,"Bearer server-only");await api.zuwaraV2("/patients/me",{method:"PATCH",body:{full_name:"Patient"}});assert.equal(calls[1].init.method,"PATCH");assert.equal(calls[1].init.body,JSON.stringify({full_name:"Patient"}));
});
