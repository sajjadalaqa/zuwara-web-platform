import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';
const dependency=createRequire(import.meta.url);
function load(path,mocks={}) {
  const {outputText}=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
  const exports={};new Function('require','exports',outputText)(name=>name in mocks?mocks[name]:dependency(name),exports);return exports;
}
const model=load('src/lib/cart/model.ts');
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
    './providers':{getD4hProviders:async(locale,id)=>id===10?[{id:5,name:'A'},{id:7,name:'B'}]:[{id:7,name:'B'},{id:9,name:'C'}]},
    './bookings':{homeAddresses:async()=>[{id:4,label:'Home',zoneId:9}]},
    './patient':{d4hPatientApi:async(path,options={})=>{
      calls.push({path,...options});
      if(path.includes('/availability?'))return {data:{slots:['09:00',{start_time:'10:00'}]}};
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
  await api.cartSlots(lines,7,model.todayInRiyadh(),'en');assert.ok(calls.at(-1).path.includes('duration_minutes=105'));
  const quote=await api.previewCart({lines,providerId:7,addressId:4,date:model.todayInRiyadh(),time:'09:00',notes:'Test'},'en');
  assert.equal(quote.amountHalalas,30000);assert.deepEqual(calls.at(-1).body.services,[{service_id:10,quantity:2},{service_id:11,quantity:1}]);assert.equal(calls.at(-1).body.zone_id,9);
  await assert.rejects(()=>api.createCart(quote.token,'en'));const group=await api.createCart(quote.token,'en');
  assert.equal(groups.size,1);assert.equal(group.amountHalalas,31000);assert.equal(calls.at(-1).idempotencyKey,calls.at(-2).idempotencyKey);
  const count=calls.length;await assert.rejects(()=>api.createCart('tampered','en'));identity='patient-two';await assert.rejects(()=>api.createCart(quote.token,'en'));await assert.rejects(()=>api.payCart(group.receipt,'en'));assert.equal(calls.length,count);
  identity='patient-one';assert.equal((await api.resumeCart(group.receipt)).paid,false);assert.equal(calls.length,count);
  assert.equal(await api.payCart(group.receipt,'en'),true);assert.deepEqual(calls.at(-1).body,{});assert.equal(calls.at(-1).path,'/bookings/groups/'+groupId+'/pay');
  const claim=crypto.unseal(quote.token,secret,'zuwara_cart_booking');const expired=crypto.seal({...claim,expires:Date.now()-1},secret,'zuwara_cart_booking');await assert.rejects(()=>api.createCart(expired,'en'));
  await assert.rejects(()=>api.prepareCart([{serviceId:10,quantity:20}],'en'));
  await assert.rejects(()=>api.previewCart({lines,providerId:7,addressId:999,date:model.todayInRiyadh(),time:'09:00',notes:''},'en'));
});