import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import ts from "typescript";
let serial = 0;
async function load(path, bindings) {
  globalThis.__careHarness = bindings;
  let source = (await readFile(new URL(path, import.meta.url), "utf8"))
    .replace(/^\uFEFF/, "")
    .replace(/^import[\s\S]*?;\r?$/gm, "");
  const prelude =
    "const {" +
    Object.keys(bindings).join(",") +
    "}=globalThis.__careHarness;\n";
  const { outputText } = ts.transpileModule(
    prelude + source + "\n//" + serial++,
    {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  );
  return import(
    "data:text/javascript;base64," + Buffer.from(outputText).toString("base64")
  );
}
const sealSource = (
  await readFile(new URL("../src/lib/auth/seal.ts", import.meta.url), "utf8")
).replace('import "server-only";', "");
const sealed = ts.transpileModule(sealSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const { seal, unseal } = await import(
  "data:text/javascript;base64," + Buffer.from(sealed).toString("base64")
);
const id = (value) => {
  const s = String(value);
  if (!/^[1-9]\d*$/.test(s)) throw Error();
  return s;
};
const uuid = (value) => {
  if (!/^[a-f0-9-]{36}$/i.test(value)) throw Error();
  return value.toLowerCase();
};
const halalas = (n) => {
  if (!Number.isSafeInteger(n) || n < 0) throw Error();
  return n;
};
class ZuwaraV2Error extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
    this.code = code;
  }
}
async function harness(api) {
  let owner = "owner-1";
  const jar = new Map();
  const original = process.env.NEXT_SERVER_SESSION_SECRET;
  process.env.NEXT_SERVER_SESSION_SECRET =
    "care-integration-test-secret-with-more-than-32-characters";
  const functions = await load(
    "../src/app/[locale]/dashboard/_care/commands.ts",
    {
      cookies: async () => ({
        get: (name) => (jar.has(name) ? { value: jar.get(name) } : undefined),
        set: (name, value) => jar.set(name, value),
        delete: (name) => jar.delete(name),
      }),
      requireSession: async () => ({ user: { id: owner } }),
      randomUUID,
      seal,
      unseal,
      ZuwaraV2Error,
      dateValue: (v) => v,
      numericId: id,
      knownCoupons: async () => ({ items: [] }),
      therapyCalendar: async () => ({ dates: [] }),
      consultantSlots: async () => [],
      halalas,
      patientApi: api,
      unstable_rethrow: () => {},
    },
  );
  return {
    functions,
    jar,
    setOwner: (value) => (owner = value),
    restore: () => {
      if (original === undefined) delete process.env.NEXT_SERVER_SESSION_SECRET;
      else process.env.NEXT_SERVER_SESSION_SECRET = original;
    },
  };
}
test("therapy intents survive an uncertain write, retain key and body, and bind the patient", async () => {
  const creates = [];
  let fail = true;
  const h = await harness(async (path, options) => {
    if (path === "/therapy-bookings/preview")
      return {
        data: {
          service_amount_halalas: 1001,
          tax_halalas: 150,
          payable_halalas: 1151,
          currency: "SAR",
          slot_reserved: false,
          sessions: [
            {
              session_number: 1,
              date: "2026-11-02",
              time: "1000",
              end_time: "1030",
            },
          ],
        },
      };
    creates.push(options);
    if (fail) {
      fail = false;
      throw Error("lost response");
    }
    return {
      data: {
        session_group_id: "11111111-1111-4111-8111-111111111111",
        requires_payment: false,
        sessions: [{ id: 100 }],
      },
    };
  });
  try {
    const input = {
      therapy_plan_id: 18,
      doctor_id: 49,
      patient_id: null,
      duration_minutes: 30,
      consultation_type: "online",
      problem: "Test notes",
      payment_method: "wallet",
      sessions: [{ date: "2026-11-02", time: "1000" }],
    };
    const preview = await h.functions.previewTherapyAction(input);
    assert.equal(preview.ok, true);
    assert.equal(preview.quote.payable, 1151);
    h.setOwner("other-patient");
    assert.equal(
      (await h.functions.submitCareAction("therapy", preview.quote.token))
        .error,
      "INVALID_INTENT",
    );
    assert.equal(creates.length, 0);
    h.setOwner("owner-1");
    assert.equal(
      (await h.functions.submitCareAction("therapy", preview.quote.token))
        .error,
      "PREPARE_REQUIRED",
    );
    await h.functions.prepareCareAction("therapy", preview.quote.token);
    const first = await h.functions.submitCareAction(
      "therapy",
      preview.quote.token,
    );
    assert.equal(first.uncertain, true);
    const pending = await h.functions.pendingCareIntent("therapy");
    assert.equal(pending.token, preview.quote.token);
    const second = await h.functions.submitCareAction("therapy", pending.token);
    assert.equal(second.group, "11111111-1111-4111-8111-111111111111");
    assert.equal(creates[0].idempotencyKey, creates[1].idempotencyKey);
    assert.deepEqual(creates[0].body, creates[1].body);
    assert.equal(creates[0].body.user_id, undefined);
    assert.equal(creates[0].body.payable_halalas, undefined);
    assert.equal(h.jar.size, 0);
  } finally {
    h.restore();
  }
});
test("gateway rescheduling keeps the original intent for payment and submission recovery", async () => {
  const submits = [];
  let paid = false;
  const h = await harness(async (path, options) => {
    if (path.endsWith("/reschedule/preview"))
      return { data: { charge_halalas: 4901, currency: "SAR" } };
    submits.push(options);
    return {
      data: paid
        ? { request: { id: 123 } }
        : { requires_payment: true, checkout: { id: "checkout-1" } },
    };
  });
  try {
    const preview = await h.functions.previewRescheduleAction({
      appointment_id: 3253,
      date: "2026-11-03",
      time: "1100",
      duration_minutes: 60,
      reason: "Test reschedule",
      payment_method: "myfatoorah",
    });
    assert.equal(preview.ok, true);
    await h.functions.prepareCareAction("reschedule:3253", preview.quote.token);
    const first = await h.functions.submitCareAction(
      "reschedule:3253",
      preview.quote.token,
    );
    assert.equal(first.checkout, "checkout-1");
    const pending = await h.functions.pendingCareIntent("reschedule:3253");
    assert.equal(pending.checkoutId, "checkout-1");
    paid = true;
    const result = await h.functions.submitCareAction(
      "reschedule:3253",
      pending.token,
    );
    assert.equal(result.requestId, 123);
    assert.equal(submits[0].idempotencyKey, submits[1].idempotencyKey);
    assert.deepEqual(submits[0].body, submits[1].body);
    assert.equal(h.jar.size, 0);
  } finally {
    h.restore();
  }
});
test("D4H notification operations use UUID targets and mark only the explicit displayed set", async () => {
  const calls = [],
    notificationId = "22222222-2222-4222-8222-222222222222";
  const api = await load("../src/lib/api/d4h/notifications.ts", {
    uuid,
    pagination: (p) => p.meta.pagination,
    d4hPatientApi: async (path, options) => {
      calls.push({ path, options });
      if (path === "/notifications/unread-count")
        return { data: { unread_count: 7 } };
      return {
        data: [
          {
            source_record_id: notificationId,
            type: "booking",
            title: "Visit update",
            body: "Message",
            is_read: false,
            created_at: "2026-10-22T09:00:00Z",
            target: { entity: "booking", id: 88 },
          },
        ],
        meta: {
          pagination: {
            current_page: 1,
            per_page: 8,
            total: 1,
            has_more: false,
          },
        },
      };
    },
  });
  const result = await api.visitNotifications({ filter: "all", page: 1 }, "en");
  assert.equal(result.items[0].href, "/dashboard/home-visits/88");
  assert.equal(result.counts.unread, 7);
  await api.visitMarkDisplayed(["d4h:" + notificationId]);
  assert.deepEqual(calls.at(-1).options.body, {
    notification_ids: [notificationId],
  });
  const count = calls.length;
  await assert.rejects(
    api.visitMarkDisplayed(["d4h:" + notificationId, "d4h:" + notificationId]),
  );
  assert.equal(calls.length, count);
  await api.visitMarkRead(notificationId, false);
  assert.deepEqual(calls.at(-1).options.body, { read: false });
});
test("follow-up video credentials are requested for the selected context and cannot switch reviews", async () => {
  const calls = [],
    followUp = "33333333-3333-4333-8333-333333333333";
  let wrong = false;
  const api = await load("../src/lib/api/zuwara/video.ts", {
    uuid,
    patientApi: async (path, options) => {
      calls.push({ path, options });
      if (!options) return { data: { can_join: true } };
      return {
        data: {
          meeting_id: "meeting-1",
          appointment_id: 3253,
          follow_up_id: wrong
            ? "44444444-4444-4444-8444-444444444444"
            : followUp,
          channel_name: "followup-channel",
          agora_uid: 123,
          token: "test-rtc",
          app_id: "test-app",
          attendance_token: "test-attendance",
          expires_at: new Date(Date.now() + 60000).toISOString(),
          context_ends_at: null,
        },
      };
    },
  });
  await api.videoStatus("3253", followUp);
  assert.match(calls[0].path, /follow_up_id=/);
  await api.videoSession("3253", followUp);
  assert.deepEqual(calls[1].options.body, { follow_up_id: followUp });
  wrong = true;
  await assert.rejects(api.videoSession("3253", followUp));
});

test("oversized clinical notes are rejected before preview or booking and cannot overflow retry cookies", async () => {
  let calls=0;
  const h=await harness(async()=>{calls++;throw Error("Must not reach backend");});
  try {
    const result=await h.functions.previewTherapyAction({therapy_plan_id:18,doctor_id:49,patient_id:null,duration_minutes:30,consultation_type:"online",problem:"x".repeat(3500),payment_method:"wallet",sessions:[{date:"2026-11-02",time:"1000"}]});
    assert.equal(result.ok,false);
    assert.equal(result.error,"NOTES_TOO_LONG");
    assert.equal(calls,0);
    assert.equal(h.jar.size,0);
  } finally {h.restore();}
});

test("coupon preview and creation use the same backend-resolved ID and canonical code", async()=>{
 const original=process.env.NEXT_SERVER_SESSION_SECRET;
 process.env.NEXT_SERVER_SESSION_SECRET="coupon-integration-test-secret-more-than-32-characters";
 const calls=[];
 try{
  const api=await load("../src/lib/api/zuwara/booking.ts",{randomUUID,seal,unseal,halalas,requireSession:async()=>({user:{id:"owner-1"}}),patientApi:async(path,options)=>{calls.push({path,options});if(path.startsWith("/coupons?"))return {data:[{id:7,code:"SAVE10"}]};if(path==="/appointments/preview")return{data:{pricing:{service:{halalas:10000},discount:{halalas:1000},subtotal:{halalas:9000},tax:{halalas:1350},payable:{halalas:10350},currency:"SAR"},can_create:true,slot_reserved:false}};return{data:{appointment:{id:999},requires_payment:false}};}});
  const preview=await api.previewBooking({doctor_id:49,patient_id:null,date:"2026-11-03",time:"1000",duration_minutes:30,consultation_type:"online",problem:"Test",payment_method:"wallet",coupon_code:"save10"});
  assert.equal(preview.breakdown.discount,1000);assert.equal(preview.payableHalalas,10350);
  await api.createBooking(preview.token);
  const bodies=calls.filter(call=>call.options?.body).map(call=>call.options.body);
  assert.equal(bodies.length,2);assert.equal(bodies[0].coupon_id,7);assert.equal(bodies[0].coupon_code,"SAVE10");assert.deepEqual(bodies[0],bodies[1]);assert.equal(bodies[1].discount,undefined);
 }finally{if(original===undefined)delete process.env.NEXT_SERVER_SESSION_SECRET;else process.env.NEXT_SERVER_SESSION_SECRET=original;}
});
