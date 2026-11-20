import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const dependency=createRequire(import.meta.url);
function load(path,mocks={}){const {outputText}=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}});const exports={};new Function('require','exports',outputText)(name=>name in mocks?mocks[name]:dependency(name),exports);return exports;}
const auth=load('src/lib/auth/consultant-return.ts');
test('therapy destination survives login, registration and OTP while rejecting unrelated or external paths',()=>{
 const search='?consultantReturn='+encodeURIComponent('/therapy/4/availability')+'&bookingFlow=therapy';
 assert.equal(auth.consultantReturn(search),'/therapy/4/availability');
 for(const path of ['/login-page','/register-page','/verify-otp-page'])assert.equal(auth.consultantAuthHref(path,search),path+search);
 assert.equal(auth.consultantSignInDestination(search),'/therapy/4/availability?bookingSignIn=success&bookingFlow=therapy');
 for(const target of ['https://example.com','//example.com','/dashboard','/therapy/0/availability','/therapy/4/availability/extra','/therapy/4/../availability','/therapy/4/availability?other=1'])assert.equal(auth.consultantReturn('?consultantReturn='+encodeURIComponent(target)+'&bookingFlow=therapy'),null);
 assert.equal(auth.consultantReturn('?consultantReturn=%2Ftherapy%2F4%2Favailability'),null);
 assert.equal(auth.consultantSignInDestination('?consultantReturn=%2Fcart&bookingFlow=cart'),'/cart?bookingSignIn=success&bookingFlow=cart');
});
const plan={id:4,title:{en:'Sleep therapy',ar:'Sleep'},image_url:null,total_sessions:20,sessions_recommended:true};
test('public catalog requests the anonymous paginated endpoint without a patient token',async()=>{
 const calls=[];const api=load('src/lib/therapy/public-plans.ts',{'server-only':{},'@/lib/api/zuwara/v2':{getZuwaraV2:async(...args)=>{calls.push(args);return {data:[plan],meta:{pagination:{current_page:2,per_page:12,total:20,has_more:false}}};}},'@/lib/api/pagination':{pagination:p=>p.meta.pagination}});
 const result=await api.publicTherapyPlans(2,'ar');assert.deepEqual(calls,[['/public/therapy-plans?page=2&per_page=12','ar']]);assert.deepEqual(result.items,[plan]);assert.equal(result.page,2);
});
test('availability gates anonymous visitors and returns signed-in visitors to the exact plan booking section',async()=>{
 for(const signedIn of [false,true]){const redirects=[];const api=load('src/app/[locale]/therapy/[id]/availability/page.tsx',{'next-intl/server':{getLocale:async()=> 'ar'},'next/navigation':{redirect:path=>{redirects.push(path);throw Error('REDIRECT');},notFound:()=>{throw Error('NOT_FOUND');}},'@/lib/auth/session':{readHeaderSession:async()=>({signedIn,sessionExpiresAt:Date.now()+60000})}});
 await assert.rejects(()=>api.default({params:Promise.resolve({id:'4'})}),/REDIRECT/);assert.equal(redirects.length,1);
 if(signedIn)assert.equal(redirects[0],'/ar/dashboard/therapy/4#therapy-booking');else{const url=new URL(redirects[0],'https://example.com');assert.equal(url.pathname,'/ar/login-page');assert.equal(url.searchParams.get('consultantReturn'),'/therapy/4/availability');assert.equal(url.searchParams.get('bookingFlow'),'therapy');}
 await assert.rejects(()=>api.default({params:Promise.resolve({id:'invalid'})}),/NOT_FOUND/);
 }
});
function pageHarness({publicAvailable=true,signedIn=false}={}){let privateCalls=0;const css=new Proxy({},{get:(_,name)=>name==='__esModule'?false:String(name)});const api=load('src/app/[locale]/therapy/page.tsx',{'next/link':{default:({children,...props})=>React.createElement('a',props,children)},'next-intl/server':{getLocale:async()=> 'en'},'@/lib/auth/session':{readHeaderSession:async()=>({signedIn,sessionExpiresAt:Date.now()+60000})},'@/lib/api/zuwara/care':{careList:async()=>{privateCalls++;return {items:[plan],total:1,page:1,perPage:12,hasMore:false};}},'@/lib/therapy/public-plans':{publicTherapyPlans:async()=>{if(!publicAvailable)throw Error('404');return {items:[plan],total:1,page:1,perPage:12,hasMore:false};}},'./therapy.module.css':{default:css}});return {api,privateCalls:()=>privateCalls};}
test('anonymous visitors can browse public plans and check availability without private API access',async()=>{const h=pageHarness();const html=renderToStaticMarkup(await h.api.default({searchParams:Promise.resolve({})}));assert.ok(html.includes('Sleep therapy'));assert.ok(html.includes('href="/therapy/4/availability"'));assert.ok(html.includes('Check availability'));assert.equal(h.privateCalls(),0);});
test('missing public endpoint shows a graceful anonymous state and uses the existing catalog only for signed-in visitors',async()=>{for(const signedIn of [false,true]){const h=pageHarness({publicAvailable:false,signedIn});const html=renderToStaticMarkup(await h.api.default({searchParams:Promise.resolve({})}));assert.equal(h.privateCalls(),signedIn?1:0);assert.ok(html.includes(signedIn?'Sleep therapy':'Therapy plans are temporarily unavailable'));}});
