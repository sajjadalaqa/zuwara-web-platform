import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
async function load(path, bindings) {
 const source=(await readFile(new URL(path,import.meta.url),"utf8")).replace(/^import .*;\r?$/gm, "");
 globalThis.__responseDisplay=bindings;
 const declarations="const {"+Object.keys(bindings).join(",")+"}=globalThis.__responseDisplay;\n";
 const {outputText}=ts.transpileModule(declarations+source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}});
 return import("data:text/javascript;base64,"+Buffer.from(outputText).toString("base64"));
}
const row={id:49,doctor_number:"DR49",name:"Consultant",name_ar:null,image_url:null,designation:null,designation_ar:null,experience_years:0,rating:0,reviews_count:0,patients_served:0,starting_price:"0.00",currency:"SAR",category:{id:2,title:"Care",title_ar:null},classification:null,consultation_types:["chat","video"],duration_options:[{minutes:15,price:"0.00",price_halalas:0}],accepts_instant:{public:true,private:true},email:"private@example.test"};
test("consultant mapping retains display fields and zero values without exposing private fields",async()=>{
 const calls=[];
 const api=await load("../src/lib/api/zuwara/discovery.ts",{cache:f=>f,getLocale:async()=>"en",readSession:async()=>null,pagination:p=>p.meta.pagination,zuwaraV2:async path=>{calls.push(path);return {data:[{...row,id:path.includes("page=2")?50:49}],meta:{pagination:{has_more:!path.includes("page=2")}}};}});
 const view=api.doctorView(row);
 assert.equal(view.reviewsCount,0);assert.equal(view.acceptsInstant,true);assert.equal(view.rating,0);assert.equal(view.startingPrice,"0.00");assert.deepEqual(view.consultationTypes,["chat","video"]);assert.equal(view.email,undefined);
 assert.deepEqual((await api.consultantDirectory()).map(d=>d.id),[49,50]);assert.equal(calls.length,2);
});
test("ancillary outages preserve consultants and service locations instead of hiding the page",async()=>{
 class ZuwaraV2Error extends Error {}
 const location={id:7,title:"Clinic",title_ar:null,address:"Main Street",address_ar:null};
 const api=await load("../src/lib/api/zuwara/doctors.ts",{ZuwaraV2Error,consultantCategories:async()=>{throw Error("categories unavailable")},consultantDirectory:async()=>[row],doctorView:r=>({...r,consultationTypes:r.consultation_types}),discovery:async()=>({data:{...row,service_locations:[location],about:{en:null,ar:"Arabic biography"},services:[],expertise:[]}}),calendar:async()=>{throw Error("availability unavailable")}});
 const listing=await api.searchZuwaraDoctors({date:"2026-10-23"});assert.equal(listing.available,true);assert.equal(listing.doctors.length,1);assert.equal(listing.doctors[0].scheduleStatus,"unavailable");
 const profile=await api.getZuwaraDoctorProfile(49);assert.equal(profile.serviceLocations[0].address,"Main Street");assert.equal(profile.aboutAr,"Arabic biography");assert.equal(profile.scheduleStatus,"unavailable");assert.match(profile.scheduleMessage,/retry/i);
});
