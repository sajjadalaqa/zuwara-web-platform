import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(file, deps = {}) {
  const source = (await readFile(new URL("../" + file, import.meta.url), "utf8")).replace(/^\uFEFF/, "").replace(/^import .*;\r?$/gm, line => line.includes('from "node:crypto"') && !("randomUUID" in deps) ? line : "");
  globalThis.__platformTest = deps;
  const prefix = Object.keys(deps).length ? "const {" + Object.keys(deps).join(",") + "} = globalThis.__platformTest;\n" : "";
  const { outputText } = ts.transpileModule(prefix + source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } });
  return import("data:text/javascript;base64," + Buffer.from(outputText).toString("base64"));
}
const { pagination, halalas } = await load("src/lib/api/pagination.ts");
const { seal, unseal } = await load("src/lib/auth/seal.ts");
const secret = "integration-test-secret-longer-than-thirty-two-characters";
class ApiError extends Error { constructor(status, code = "UNAVAILABLE") { super(code); this.status = status; this.code = code; } }
const envelope = (data, page = 1, more = false, total = data.length) => ({ data, meta: { pagination: { current_page: page, per_page: 50, total, last_page: more ? page + 1 : page, has_more: more } } });

test("wallet balance and 30-day totals use server halalas and all statement pages", async () => {
  const calls = [];
  const rows = [
    { id: 1, transaction_id: "T1", appointment_number: null, currency: "SAR", amount_halalas: 101, direction: "credit", summary: null, created_at: "2026-10-21T10:00:00+03:00" },
    { id: 2, transaction_id: "T2", appointment_number: "A1", currency: "SAR", amount_halalas: 50, direction: "debit", summary: null, created_at: "2026-10-21T11:00:00+03:00" },
  ];
  const api = await load("src/app/[locale]/dashboard/wallet/service.ts", {
    cache: fn => fn, pagination, halalas, requireSession: async()=>({}), createRecharge: async()=>({ok:false}),
    patientApi: async path => {
      calls.push(path);
      if (path === "/wallet") return { data: { currency: "SAR", balance_halalas: 51 } };
      const query = new URL("https://test" + path).searchParams;
      if (query.has("start_date")) return envelope([rows[Number(query.get("page")) - 1]], Number(query.get("page")), query.get("page") === "1", 2);
      if (query.get("direction")) return envelope(rows.filter(r=>r.direction === query.get("direction")));
      return envelope(rows);
    },
  });
  assert.deepEqual(await api.getWalletSummary(), { balance: .51, currency: "SAR", moneyIn30d: 1.01, moneyOut30d: .5 });
  const transactions = await api.getTransactions({ type: "all", page: 1 }, "en");
  assert.deepEqual(transactions.counts, { all: 2, credit: 1, debit: 1 });
  assert.equal(transactions.items[0].type, "credit");
  assert.equal(transactions.items[0].method, "");
  assert.ok(calls.some(path=>path.includes("page=2")));
  assert.throws(()=>halalas(1.5));
});

test("reports use independent backend tokens, never trust download URLs, and reject unsafe source paths", async () => {
  const calls = [];
  const api = await load("src/lib/api/reports.ts", {
    cache: fn=>fn, pagination, requireSession: async()=>({}),
    patientApi: async path => { calls.push(["zuwara",path]); return envelope([{ id:"ignored", source_record_id:51, document_type:"prescription", issued_at:"2026-10-14T12:00:00+03:00", download_url:"https://evil.example/private", doctor:{name:{en:"Doctor",ar:null}} }]); },
    d4hPatientApi: async path => { calls.push(["d4h",path]); throw new ApiError(503); },
  });
  const reports = await api.getSourceReports("zuwara","en");
  assert.equal(reports[0].id,"zuwara:prescription:51");
  assert.equal(reports[0].fileSize,null);
  assert.equal(JSON.stringify(reports).includes("evil.example"),false);
  assert.deepEqual(api.reportPath(reports[0].id),{ source:"zuwara",path:"/reports/prescription/51/download",filename:"prescription-51.pdf" });
  for(const id of ["rec_1","d4h:prescription:51","zuwara:d4h_result:51","zuwara:prescription:../1","https://evil.example"]) assert.equal(api.reportPath(id),null);
  await assert.rejects(api.getSourceReports("d4h","en"),e=>e.status===503);
  assert.deepEqual(calls.map(c=>c[0]),["zuwara","d4h"]);
});

test("PDF route rejects anonymous requests before contacting either backend", async () => {
  let primaryCalls=0;
  const route = await load("src/app/[locale]/dashboard/records/[id]/file/route.ts", {
    randomUUID: ()=>"request-id", readSession: async()=>null,
    readD4hSession: async()=>{primaryCalls++;throw Error("must not read linked session");},
    reportPath: ()=>{primaryCalls++;throw Error("must not parse a report before authentication");},
  });
  const response=await route.GET(new Request("https://app.test/dashboard/records/rec_1/file"),{params:Promise.resolve({locale:"en",id:"rec_1"})});
  assert.equal(response.status,401);assert.equal(primaryCalls,0);assert.equal(response.headers.get("cache-control"),"private, no-store");
});

test("uncertain recharge retries retain the saved key and never credit the browser wallet", async () => {
  const oldSecret=process.env.NEXT_SERVER_SESSION_SECRET;process.env.NEXT_SERVER_SESSION_SECRET=secret;
  const jar=new Map(),keys=[];let attempts=0;
  const api=await load("src/lib/api/zuwara/recharges.ts",{
    randomUUID:()=>"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",seal,
    cookies:async()=>({set:(name,value)=>jar.set(name,value),delete:name=>jar.delete(name)}),
    requireSession:async()=>({user:{id:"patient"}}),
    readCookie:async name=>jar.has(name)?unseal(jar.get(name),secret,name):null,ZuwaraV2Error:ApiError,
    patientApi:async(path,options)=>{
      assert.ok(jar.has("zuwara_recharge"),"intent must be persisted before requesting an invoice");
      keys.push(options.idempotencyKey);attempts++;
      if(attempts===1)throw new ApiError(503);
      return {data:{id:"bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",status:"pending",currency:"SAR",amount_halalas:2500,payment_url:"https://sa.myfatoorah.com/pay/test",wallet_recharge_id:null}};
    },
  });
  try{
    assert.deepEqual(await api.createRecharge(2500),{ok:false,error:"generic"});
    assert.deepEqual(await api.createRecharge(2600),{ok:false,error:"generic"});
    assert.equal(attempts,1);
    const retry=await api.createRecharge(2500);
    assert.equal(retry.ok,true);assert.equal(keys[0],keys[1]);
    assert.throws(()=>api.paymentUrl("https://sa.myfatoorah.com.evil.example/pay"));
    assert.throws(()=>api.paymentUrl("javascript:alert(1)"));
  }finally{if(oldSecret===undefined)delete process.env.NEXT_SERVER_SESSION_SECRET;else process.env.NEXT_SERVER_SESSION_SECRET=oldSecret;}
});

test("booking quotes bind identity and content while creation retries reuse the same key", async () => {
  const oldSecret=process.env.NEXT_SERVER_SESSION_SECRET;process.env.NEXT_SERVER_SESSION_SECRET=secret;
  let identity="patient-a";const keys=[];let calls=0;
  const api=await load("src/lib/api/zuwara/booking.ts",{
    randomUUID:()=>"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",seal,unseal,halalas,
    requireSession:async()=>({user:{id:identity}}),
    patientApi:async(path,options)=>{
      calls++;if(path==="/appointments/preview")return{data:{pricing:{payable:{halalas:11500},currency:"SAR"},can_create:true,slot_reserved:false}};
      assert.equal(path,"/appointments");assert.equal(options.body.user_id,undefined);keys.push(options.idempotencyKey);
      return{data:{appointment:{id:102},requires_payment:true}};
    },
  });
  try{
    const input={doctor_id:49,patient_id:null,date:"2026-11-02",time:"1000",duration_minutes:30,consultation_type:"online",problem:"Test",payment_method:"myfatoorah"};
    const preview=await api.previewBooking(input);
    assert.equal(preview.token.includes("patient-a"),false);
    identity="patient-b";await assert.rejects(api.createBooking(preview.token));assert.equal(calls,1);
    identity="patient-a";await assert.rejects(api.createBooking(preview.token+"bad"));assert.equal(calls,1);
    await api.createBooking(preview.token);await api.createBooking(preview.token);assert.deepEqual(keys,[keys[0],keys[0]]);
  }finally{if(oldSecret===undefined)delete process.env.NEXT_SERVER_SESSION_SECRET;else process.env.NEXT_SERVER_SESSION_SECRET=oldSecret;}
});

test("checkout confirms through the backend and cannot use browser success or an untrusted redirect",async()=>{
  let paid=false;const calls=[];
  const row=()=>({checkout_id:"owned-checkout",appointment_id:102,status:paid?"paid":"pending",paid,amount:"115.00",currency:"SAR",session_id:null,checkout_url:null});
  const api=await load("src/lib/api/zuwara/checkouts.ts",{patientApi:async(path,options)=>{calls.push({path,options});if(path.endsWith("/confirm")){paid=true;return{data:{success:true}};}return{data:row()};}});
  assert.equal((await api.readCheckout("owned-checkout")).paid,false);
  assert.equal((await api.confirmCheckout("owned-checkout","gateway-reference")).paid,true);
  assert.deepEqual(calls[1].options.body,{payment_id:"gateway-reference"});
  assert.throws(()=>api.checkoutUrl("https://tamara.co.evil.example/pay"));
  await assert.rejects(api.readCheckout("../other"));
});

test("chat passes the same message key on retries and suppresses unsafe attachment schemes",async()=>{
  const calls=[];const row={id:"message-1",type:"text",text:"Hello",sender:{id:1,role:"patient",name:"Patient"},created_at:null,deleted:false,attachment_url:"javascript:alert(1)"};
  const api=await load("src/lib/api/zuwara/chat.ts",{patientApi:async(path,options)=>{calls.push({path,options});return{data:{message:row}};}});
  const key="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const one=await api.sendChat("102","Hello",key);await api.sendChat("102","Hello",key);
  assert.equal(one.attachment_url,null);assert.equal(calls[0].options.idempotencyKey,calls[1].options.idempotencyKey);
  assert.deepEqual(calls[0].options.body,{message:"Hello"});await assert.rejects(api.sendChat("../102","Hello",key));
});


test("legacy unavailable appointment fields remain unspecified and currency retains halalas",async()=>{
  const api=await load("src/lib/api/zuwara/appointments.ts",{cache:fn=>fn,patientApi:async()=>({}),halalas,pagination});
  const row={id:102,appointment_number:"A102",kind:"normal",status:{code:2,key:"completed"},scheduled:{date:"",time:"",end_time:"",duration_minutes:null},consultation_type:"online",doctor:null,amount:{payable_halalas:51,currency:"SAR"},problem:null,created_at:"2026-10-01",updated_at:"2026-10-01"};
  assert.equal(api.validateAppointment(row),row);
  assert.equal(api.startsAt(row),"");
  assert.equal(api.startsAt({...row,scheduled:{date:"2026-10-21",time:"1430",end_time:"1500",duration_minutes:30}}),"2026-10-21T11:30:00.000Z");
  const format=await load("src/app/[locale]/dashboard/appointments/format.ts");
  assert.equal(format.money(.51,"SAR","en"),"SAR 0.51");
  assert.equal(format.fullDate("","en"),"—");
});
test("home visits use owned addresses and stored service durations, and payment retries retain their group",async()=>{
  const oldSecret=process.env.NEXT_SERVER_SESSION_SECRET;process.env.NEXT_SERVER_SESSION_SECRET=secret;
  let identity="patient";const calls=[];let payments=0;
  const group="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const api=await load("src/lib/api/d4h/bookings.ts",{
    cache:fn=>fn,randomUUID:()=>"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",seal,unseal,pagination,halalas,
    requireSession:async()=>({user:{id:identity}}),
    d4hV2:async()=>envelope([{id:650,name:"Home service",name_ar:null,duration:"0:30",visit_type:"on_site"}]),
    d4hPatientApi:async(path,options)=>{
      calls.push({path,options});
      if(path==="/patients/addresses")return{data:[{id:1,address:"Saved address"}]};
      if(path.startsWith("/providers/"))return{data:{slots:["10:00"]}};
      if(path==="/bookings/preview"){assert.equal(options.body.user_id,undefined);assert.equal(options.body.amount,undefined);return{data:{total_halalas:32200,currency:"SAR"}};}
      if(path==="/bookings")return{data:{booking_group_id:group,quote:{total_halalas:32200,currency:"SAR"},payment_state:"unpaid"}};
      if(path.endsWith("/pay")){payments++;return{data:{payment_state:payments===1?"verifying":"paid"}};}
      throw Error("Unexpected endpoint");
    },
  });
  try{
    assert.deepEqual(await api.homeSlots(67,650,"2026-11-02"),["10:00"]);
    assert.ok(calls[0].path.includes("duration_minutes=30"));
    const quote=await api.previewHome({providerId:67,serviceId:650,addressId:1,date:"2026-11-02",time:"10:00",notes:"Test",amount:1,user_id:999});
    identity="another-patient";await assert.rejects(api.createHome(quote.token));
    identity="patient";const visit=await api.createHome(quote.token);assert.equal(visit.paid,false);
    assert.equal(await api.payHome(group),false);assert.equal(await api.payHome(group),true);
    const payCalls=calls.filter(c=>c.path.endsWith("/pay"));
    assert.equal(payCalls[0].path,payCalls[1].path);assert.deepEqual(payCalls[0].options.body,{});
    await assert.rejects(api.previewHome({providerId:67,serviceId:650,addressId:999,date:"2026-11-02",time:"10:00",notes:"Test"}));
  }finally{if(oldSecret===undefined)delete process.env.NEXT_SERVER_SESSION_SECRET;else process.env.NEXT_SERVER_SESSION_SECRET=oldSecret;}
});
