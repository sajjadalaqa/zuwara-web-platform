import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
const dependency=createRequire(import.meta.url);
function load(path,mocks={}) {
  const {outputText}=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  const exports={};new Function('require','exports',outputText)(name=>name in mocks?mocks[name]:name==='@/lib/cart/scheduling'?scheduling:dependency(name),exports);return exports;
}
const scheduling=load('src/lib/cart/scheduling.ts');
const model=load('src/lib/cart/model.ts');
const addressLocation=load('src/lib/cart/address-location.ts');
const crypto=load('src/lib/auth/seal.ts');
const auth=load('src/lib/auth/consultant-return.ts');
test('cart rejects duplicate services and invalid quantities and converts prices exactly',()=>{
  for(const lines of [[],[{serviceId:1,quantity:21}],[{serviceId:1,quantity:0}],[{serviceId:1,quantity:1},{serviceId:1,quantity:2}]])assert.throws(()=>model.cartSelection(lines));
  assert.equal(model.moneyHalalas('450.10'),45010);assert.equal(model.moneyHalalas('0.01'),1);assert.equal(model.moneyHalalas('1.001'),null);
  assert.equal(model.visitMinutes('00:45'),45);assert.equal(model.visitMinutes('45'),45);assert.throws(()=>model.visitMinutes('481'));
});
test('booking completion subtracts only booked quantities and cannot subtract twice',()=>{
  const group='12345678-1234-4234-8234-123456789012';
  const original={items:[{serviceId:1,quantity:3,name:'Test',unitHalalas:100},{serviceId:2,quantity:1,name:'Other',unitHalalas:200}],completed:[]};
  const lines=[{serviceId:1,quantity:2}],next=model.removeBooked(original,group,lines);
  assert.deepEqual(next.items.map(i=>i.quantity),[1,1]);assert.deepEqual(model.removeBooked(next,group,lines),next);assert.equal(model.readCart('{broken').items.length,0);
});
test('cart return survives authentication and rejects external redirects',()=>{
  const query='consultantReturn=%2Fcart&bookingFlow=cart';assert.equal(auth.consultantReturn(query),'/cart');assert.ok(auth.consultantAuthHref('/otp',query).includes('bookingFlow=cart'));
  assert.equal(auth.consultantReturn('consultantReturn=%2Fcart'),null);assert.equal(auth.consultantReturn('consultantReturn=https%3A%2F%2Fevil.test&bookingFlow=cart'),null);
});
test('checkout uses common providers, quantity duration, authoritative totals and stable booking/payment references',async()=>{
  const secret='cart-tests-only-32-characters-minimum';process.env.NEXT_SERVER_SESSION_SECRET=secret;
  let identity='patient-one',timeout=true;const calls=[],groups=new Map(),groupId='12345678-1234-4234-8234-123456789012';
  const api=load('src/lib/api/d4h/cart.ts',{
    'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,
    '@/lib/auth/session':{requireSession:async()=>({user:{id:identity}})},
    '@/lib/api/pagination':{halalas:n=>{assert.ok(Number.isSafeInteger(n)&&n>=0);return n;}},
    './v2':{d4hV2:async path=>({data:{id:Number(path.split('/').at(-1)),name:'Service',duration:path.endsWith('/10')?'30':'00:45',visit_type:'home',price:{currency:'SAR',final:'100.00'}}})},
    './providers':{getD4hProviders:async(locale,filters)=>{assert.deepEqual(filters,{serviceIds:[10,11],packageIds:[]});return [{id:7,name:'B'}];}},
    './bookings':{homeAddresses:async()=>[{id:4,label:'Home',zoneId:9}]},
    './patient':{d4hPatientApi:async(path,options={})=>{
      calls.push({path,...options});
      if(path.includes('/availability?'))return {data:{slots:['09:00',{start_time:'10:00'}]}};
      if(path==='/bookings/selection-preview')return {data:{currency:'SAR',total_halalas:30000,duration_minutes:120}};
      if(path==='/bookings/preview')return {data:{currency:'SAR',total_halalas:30000}};
      if(path==='/bookings'){
        if(!groups.has(options.idempotencyKey))groups.set(options.idempotencyKey,{booking_group_id:groupId,quote:{currency:'SAR',total_halalas:31000},payment_state:'unpaid'});
        if(timeout){timeout=false;throw Error('Network lost after reservation');}return {data:groups.get(options.idempotencyKey)};
      }
      if(path.endsWith('/pay'))return {data:{payment_state:'paid'}};throw Error('Unexpected mocked request');
    }},
  });
  const lines=[{serviceId:10,quantity:2},{serviceId:11,quantity:1}],options=await api.prepareCart(lines,'en');
  assert.deepEqual(options.providers,[{id:7,name:'B'}]);assert.equal(options.minutes,105);
  const availability=await api.cartSlots(lines,7,model.todayInRiyadh(),'en',4);assert.ok(calls.at(-1).path.includes('duration_minutes=120'));assert.deepEqual(availability.slots,['09:00','10:00']);assert.equal(availability.amountHalalas,30000);assert.equal(calls.at(-2).path,'/bookings/selection-preview');assert.equal(calls.at(-2).body.address_id,4);
  const before=calls.length;await assert.rejects(()=>api.cartSlots(lines,7,model.todayInRiyadh(),'en',999));assert.equal(calls.length,before);
  const quote=await api.previewCart({lines,providerId:7,addressId:4,date:model.todayInRiyadh(),time:'09:00',notes:'Test'},'en');
  assert.equal(quote.amountHalalas,30000);assert.deepEqual(calls.at(-1).body.services,[{service_id:10,quantity:2},{service_id:11,quantity:1}]);assert.equal(calls.at(-1).body.zone_id,undefined);
  await assert.rejects(()=>api.createCart(quote.token,'en'));const group=await api.createCart(quote.token,'en');
  assert.equal(groups.size,1);assert.equal(group.amountHalalas,31000);assert.equal(calls.at(-1).idempotencyKey,calls.at(-2).idempotencyKey);
  const count=calls.length;await assert.rejects(()=>api.createCart('tampered','en'));identity='patient-two';await assert.rejects(()=>api.createCart(quote.token,'en'));await assert.rejects(()=>api.payCart(group.receipt,'en'));assert.equal(calls.length,count);
  identity='patient-one';assert.equal((await api.resumeCart(group.receipt)).paid,false);assert.equal(calls.length,count);
  assert.equal(await api.payCart(group.receipt,'en'),true);assert.deepEqual(calls.at(-1).body,{});assert.equal(calls.at(-1).path,'/bookings/groups/'+groupId+'/pay');
  const claim=crypto.unseal(quote.token,secret,'zuwara_cart_booking');const expired=crypto.seal({...claim,expires:Date.now()-1},secret,'zuwara_cart_booking');await assert.rejects(()=>api.createCart(expired,'en'));
  await assert.rejects(()=>api.prepareCart([{serviceId:10,quantity:21}],'en'));
  await assert.rejects(()=>api.previewCart({lines,providerId:7,addressId:999,date:model.todayInRiyadh(),time:'09:00',notes:''},'en'));
});

test('service and package identities stay distinct in storage, quantities and booking completion',()=>{
  const service={serviceId:5,quantity:2,name:'Service',unitHalalas:100};
  const pack={packageId:5,quantity:3,name:'Package',unitHalalas:500};
  const state=model.changeQuantity(model.changeQuantity(model.EMPTY_CART,service,2),pack,3);
  const restored=model.readCart(JSON.stringify(state));assert.equal(restored.items.length,2);
  assert.notEqual(model.selectionKey([service]),model.selectionKey([pack]));
  assert.throws(()=>model.cartSelection([{serviceId:5,packageId:5,quantity:1}]));
  assert.throws(()=>model.cartSelection([pack,pack]));
  const complete=model.removeBooked(restored,'12345678-1234-4234-8234-123456789012',[{packageId:5,quantity:2}]);
  assert.equal(complete.items[0].quantity,2);assert.equal(complete.items[1].quantity,1);
});

test('special mixed and package-only selections discover all-item providers and preserve package IDs through payment',async()=>{
  process.env.NEXT_SERVER_SESSION_SECRET='cart-tests-only-32-characters-minimum';
  const calls=[],groupId='12345678-1234-4234-8234-123456789012';
  let expectedFilters;
  const api=load('src/lib/api/d4h/cart.ts',{
    'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,
    '@/lib/auth/session':{requireSession:async()=>({user:{id:'patient'}})},
    '@/lib/api/pagination':{halalas:n=>{assert.ok(Number.isSafeInteger(n)&&n>=0);return n;}},
    './v2':{d4hV2:async path=>({data:path.includes('/packages/')?{id:5,name:'Package',catalog_price:'500.00',currency:'SAR',service_ids:[20,21]}:{id:5,name:'Service',duration:'15',visit_type:'home',price:{currency:'SAR',final:'80.00'}}})},
    './providers':{getD4hProviders:async(locale,filters)=>{assert.deepEqual(filters,expectedFilters);return [{id:7,name:'Provider'}];}},
    './bookings':{homeAddresses:async()=>[{id:4,label:'Home'}]},
    './patient':{d4hPatientApi:async(path,options={})=>{
      calls.push({path,...options});
      if(path==='/bookings/selection-preview')return {data:{duration_minutes:90,total_halalas:29900,currency:'SAR'}};
      if(path.includes('/availability?'))return {data:{slots:['10:00']}};
      if(path==='/bookings/preview')return {data:{total_halalas:30900,currency:'SAR'}};
      if(path==='/bookings')return {data:{booking_group_id:groupId,quote:{total_halalas:30900,currency:'SAR'},payment_state:'unpaid'}};
      if(path.endsWith('/pay'))return {data:{payment_state:'paid'}};
      throw Error('Unexpected '+path);
    }},
  });
  for(const lines of [[{serviceId:5,quantity:2},{packageId:5,quantity:2}],[{packageId:5,quantity:1}]]){
    expectedFilters={serviceIds:lines.flatMap(i=>i.serviceId?[i.serviceId]:[]),packageIds:[5]};
    await api.prepareCart(lines,'en');
    const availability=await api.cartSlots(lines,7,model.todayInRiyadh(),'en',4);
    assert.equal(availability.minutes,90);assert.equal(availability.amountHalalas,29900);
    const selectionBody=calls.at(-2).body;assert.equal(selectionBody.packages[0].package_id,5);
    assert.ok(!(selectionBody.services??[]).some(s=>[20,21].includes(s.service_id)));
    const quote=await api.previewCart({lines,providerId:7,addressId:4,date:model.todayInRiyadh(),time:'10:00',notes:''},'en');
    assert.equal(quote.amountHalalas,30900);const previewBody=calls.at(-1).body;
    const group=await api.createCart(quote.token,'en');assert.deepEqual(calls.at(-1).body,previewBody);
    assert.deepEqual(previewBody.packages,lines.filter(i=>i.packageId).map(i=>({package_id:i.packageId,quantity:i.quantity})));
    assert.equal(await api.payCart(group.receipt,'en'),true);
  }
});

test('normal single-service booking keeps its provider through address, availability, preview, creation and payment',async()=>{
  process.env.NEXT_SERVER_SESSION_SECRET='cart-tests-only-32-characters-minimum';
  const calls=[],groupId='12345678-1234-4234-8234-123456789012';
  const api=load('src/lib/api/d4h/bookings.ts',{
    'server-only':{},react:{cache:fn=>fn},'@/lib/cart/address-location':addressLocation,'@/lib/cart/model':model,'@/lib/auth/seal':crypto,
    '@/lib/auth/session':{requireSession:async()=>({user:{id:'patient'}})},
    '@/lib/api/pagination':{halalas:n=>n,pagination:()=>({has_more:false})},
    './v2':{d4hV2:async path=>{assert.ok(path.includes('provider_id=7'));return {data:[{id:10,name:'Normal service',duration:'15',visit_type:'home',provider:{id:7}},{id:11,name:'Another provider',duration:'15',visit_type:'home',provider:{id:8}},{id:12,name:'Special service',duration:'15',visit_type:'home',provider:null},{id:13,name:'Global',duration:'15',visit_type:'home',is_global:true}]};}},
    './patient':{d4hPatientApi:async(path,options={})=>{
      calls.push({path,...options});
      if(path==='/patients/addresses')return {data:[{id:4,address:'Home',zone_id:9}]};
      if(path.includes('/providers/7/availability?'))return {data:{slots:[],scheduling_mode:'clock_picker',requires_configured_slot:false,timezone:'UTC',server_time:new Date().toISOString()}};
      if(path==='/bookings/preview')return {data:{total_halalas:15200,currency:'SAR'}};
      if(path==='/bookings')return {data:{booking_group_id:groupId,quote:{total_halalas:15200,currency:'SAR'},payment_state:'unpaid'}};
      if(path.endsWith('/pay'))return {data:{payment_state:'paid'}};
      throw Error('Unexpected '+path);
    }},
  });
  assert.deepEqual((await api.homeServices(7)).map(s=>s.id),[10]);
  const schedule=await api.homeSlots(7,10,scheduling.todayInTimezone('UTC',1));assert.equal(schedule.schedulingMode,'clock_picker');assert.equal(schedule.timezone,'UTC');assert.deepEqual(schedule.slots,[]);
  assert.ok(calls.at(-1).path.includes('duration_minutes=15'));
  const quote=await api.previewHome({providerId:7,serviceId:10,addressId:4,date:scheduling.todayInTimezone('UTC',1),time:'10:17',notes:'Please call'});
  assert.equal(quote.amountHalalas,15200);const body=calls.at(-1).body;
  assert.equal(body.time,'10:17');assert.equal(body.date,scheduling.todayInTimezone('UTC',1));assert.equal(body.provider_id,7);assert.equal(body.address_id,4);assert.deepEqual(body.services,[{service_id:10,quantity:1}]);assert.equal(body.packages,undefined);
  const group=await api.createHome(quote.token);assert.deepEqual(calls.at(-1).body,body);
  assert.equal(await api.payHome(group.id),true);
  assert.ok(!calls.some(c=>c.path==='/providers'||c.path==='/bookings/selection-preview'));
  const count=calls.filter(c=>c.path==='/bookings/preview').length;
  await assert.rejects(()=>api.previewHome({providerId:7,serviceId:999,addressId:4,date:scheduling.todayInTimezone('UTC',1),time:'10:17',notes:''}));
  assert.equal(calls.filter(c=>c.path==='/bookings/preview').length,count);
});


test('availability exposes provider-confirmed line prices and taxes without using catalog estimates',async()=>{
 const api=load('src/lib/api/d4h/cart.ts',{
  'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,
  '@/lib/auth/session':{requireSession:async()=>({user:{id:'patient'}})},
  '@/lib/api/pagination':{halalas:n=>{assert.ok(Number.isSafeInteger(n)&&n>=0);return n;}},
  './bookings':{homeAddresses:async()=>[{id:4,label:'Home'}]},'./v2':{},'./providers':{},
  './patient':{d4hPatientApi:async path=>path==='/bookings/selection-preview'?{data:{currency:'SAR',duration_minutes:15,total_halalas:15200,lines:[{name:'Provider service',quantity:1,unit_halalas:15000,subtotal_halalas:15000,tax_halalas:200,total_halalas:15200}]}}:{data:{slots:['10:00']}}},
 });
 const result=await api.cartSlots([{serviceId:10,quantity:1}],7,model.todayInRiyadh(),'en',4);
 assert.deepEqual(result.priceLines,[{name:'Provider service',quantity:1,unitHalalas:15000,subtotalHalalas:15000,taxHalalas:200,totalHalalas:15200}]);assert.equal(result.amountHalalas,15200);
});


test('booking requests omit empty service/package arrays rather than failing min-one-line validation',()=>{
 const api=load('src/lib/api/d4h/cart.ts',{'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,'@/lib/auth/session':{},'@/lib/api/pagination':{},'./bookings':{},'./v2':{},'./providers':{},'./patient':{}});
 assert.deepEqual(api.bookingSelection([{serviceId:10,quantity:2}]),{services:[{service_id:10,quantity:2}]});
 assert.deepEqual(api.bookingSelection([{packageId:5,quantity:1}]),{packages:[{package_id:5,quantity:1}]});
 assert.deepEqual(api.bookingSelection([{serviceId:10,quantity:2},{packageId:5,quantity:1}]),{services:[{service_id:10,quantity:2}],packages:[{package_id:5,quantity:1}]});
});


test('saved-address audit distinguishes real coordinates, explicit missing coordinates and omitted location fields',()=>{
 assert.equal(addressLocation.addressLocationState({lat:'24.7',long:'46.6'}),'coordinates-present');
 assert.equal(addressLocation.addressLocationState({latitude:24.7,longitude:46.6}),'coordinates-present');
 assert.equal(addressLocation.addressLocationState({lat:null,long:null}),'coordinates-missing');
 assert.equal(addressLocation.addressLocationState({lat:150,long:46.6}),'coordinates-invalid');
 assert.equal(addressLocation.addressLocationState({}),'coordinates-not-returned');
});

test('saved-address normalization retains numeric-string zones without logging precise locations',async()=>{
 const api=load('src/lib/api/d4h/bookings.ts',{'server-only':{},react:{cache:fn=>fn},'@/lib/cart/model':model,'@/lib/cart/address-location':addressLocation,'@/lib/auth/seal':crypto,'@/lib/auth/session':{},'@/lib/api/pagination':{},'./v2':{},'./patient':{d4hPatientApi:async()=>({data:[{id:4,address:'Home',zone_id:'9',lat:'24.7',long:'46.6'},{id:5,address:'Second',lat:null,long:null}]})}});
 const addresses=await api.homeAddresses();assert.equal(addresses[0].zoneId,9);assert.equal(addresses[0].locationState,'coordinates-present');assert.equal(addresses[1].locationState,'coordinates-missing');assert.equal(addresses[0].lat,undefined);assert.equal(addresses[0].long,undefined);
});

test('coverage checks send each selected saved address without restricting the backend to a stale zone',async()=>{
 const calls=[],contexts=[];
 const api=load('src/lib/api/d4h/cart.ts',{'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,'@/lib/auth/session':{requireSession:async()=>({user:{id:'patient'}})},'@/lib/api/pagination':{halalas:n=>n},'./v2':{},'./providers':{},'./bookings':{homeAddresses:async()=>[{id:4,label:'One',zoneId:9,locationState:'coordinates-present'},{id:5,label:'Two',zoneId:10,locationState:'coordinates-present'}]},'./patient':{d4hPatientApi:async(path,options)=>{calls.push({path,options});if(path==='/bookings/selection-preview')return {data:{duration_minutes:15,total_halalas:15200,currency:'SAR'}};return {data:{slots:['10:00']}}}}});
 for(const addressId of [4,5])await api.cartSlots([{serviceId:10,quantity:1}],67,model.todayInRiyadh(),'en',addressId,(stage,context)=>{if(stage==='selection')contexts.push(context);});
 assert.deepEqual(calls.filter(c=>c.path==='/bookings/selection-preview').map(c=>({address:c.options.body.address_id,zone:c.options.body.zone_id})),[{address:4,zone:undefined},{address:5,zone:undefined}]);assert.deepEqual(contexts.map(c=>c.addressId),[4,5]);assert.ok(!JSON.stringify(contexts).includes('24.7'));
});


test('timezone boundaries, server clock skew and clock mode are handled without requiring suggested slots',()=>{
 const now=Date.parse('2026-11-18T22:30:30Z');
 assert.equal(scheduling.todayInTimezone('UTC',0,now),'2026-11-18');assert.equal(scheduling.todayInTimezone('Asia/Riyadh',0,now),'2026-11-19');
 assert.equal(scheduling.futureBookingTime('2026-11-18','23:17','UTC',now),true);assert.equal(scheduling.futureBookingTime('2026-11-18','23:17','Asia/Riyadh',now),false);assert.equal(scheduling.futureBookingTime('2026-11-19','01:30','Asia/Riyadh',now),false);
 const clock=scheduling.bookingSchedule({slots:[],scheduling_mode:'clock_picker',requires_configured_slot:false,timezone:'UTC',server_time:'2026-11-18T22:30:30Z'});assert.equal(scheduling.selectableBookingTime(clock,'2026-11-19','10:17',now),true);assert.equal(scheduling.selectableBookingTime(clock,'2026-11-18','10:17',now),false);
 assert.equal(scheduling.scheduleNow('2026-11-18T22:30:30Z',1000,2000),now+1000);assert.throws(()=>scheduling.bookingSchedule({slots:[],scheduling_mode:'clock_picker',requires_configured_slot:false,timezone:'invalid/timezone'}));
 const configured=scheduling.bookingSchedule({slots:['10:00'],timezone:'UTC'});assert.equal(scheduling.selectableBookingTime(configured,'2026-11-19','10:17',now),false);
});

test('clock mode retains resolved zones as quote metadata while sending only saved addresses through preview and creation',async()=>{
 process.env.NEXT_SERVER_SESSION_SECRET='cart-tests-only-32-characters-minimum';const calls=[];
 const api=load('src/lib/api/d4h/cart.ts',{'server-only':{},'@/lib/cart/model':model,'@/lib/auth/seal':crypto,'@/lib/auth/session':{requireSession:async()=>({user:{id:'patient'}})},'@/lib/api/pagination':{halalas:n=>n},'./v2':{d4hV2:async()=>({data:{id:10,name:'Test',duration:'15',price:{currency:'SAR',final:'150.00'}}})},'./providers':{},'./bookings':{homeAddresses:async()=>[{id:3,label:'Home',zoneId:999}]},'./patient':{d4hPatientApi:async(path,options={})=>{calls.push({path,...options});if(path==='/bookings/selection-preview')return {data:{duration_minutes:15,total_halalas:15200,currency:'SAR',zone_id:2}};if(path.includes('/availability?'))return {data:{slots:[],scheduling_mode:'clock_picker',requires_configured_slot:false,timezone:'UTC',server_time:new Date().toISOString()}};if(path==='/bookings/preview')return {data:{total_halalas:15200,currency:'SAR',zone_id:2}};if(path==='/bookings')return {data:{booking_group_id:'12345678-1234-4234-8234-123456789012',quote:{total_halalas:15200,currency:'SAR'},payment_state:'unpaid'}};throw Error(path);}}});
 const date=scheduling.todayInTimezone('UTC',1),lines=[{serviceId:10,quantity:1}];const schedule=await api.cartSlots(lines,67,date,'en',3);assert.equal(schedule.schedulingMode,'clock_picker');assert.equal(schedule.requiresConfiguredSlot,false);assert.deepEqual(schedule.slots,[]);assert.equal(schedule.timezone,'UTC');assert.equal(schedule.resolvedZoneId,2);
 const quote=await api.previewCart({lines,providerId:67,addressId:3,date,time:'10:17',notes:''},'en');assert.equal(quote.resolvedZoneId,2);await api.createCart(quote.token,'en');
 const writes=calls.filter(c=>c.method==='POST');assert.deepEqual(writes.map(c=>c.body.address_id),[3,3,3]);assert.ok(writes.every(c=>!('zone_id' in c.body)));assert.equal(writes[1].body.time,'10:17');assert.deepEqual(writes[2].body,writes[1].body);
});
