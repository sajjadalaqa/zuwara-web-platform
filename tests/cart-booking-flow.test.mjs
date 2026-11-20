
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import test from 'node:test';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const dependency=createRequire(import.meta.url);
function load(path,mocks={}){const {outputText}=ts.transpileModule(fs.readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}});const exports={};new Function('require','exports',outputText)(name=>name in mocks?mocks[name]:dependency(name),exports);return exports;}
const model=load('src/lib/cart/model.ts'),copy=load('src/lib/cart/copy.ts'),booking=load('src/lib/cart/booking-copy.ts'),availabilityErrors=load('src/lib/cart/availability-errors.ts');
const experience=load('src/lib/cart/experience-copy.ts'),geolocation=load('src/lib/cart/geolocation.ts');
const scheduling=load('src/lib/cart/scheduling.ts'),scheduleCopy=load('src/lib/cart/scheduling-copy.ts');
const css=new Proxy({},{get:(_,name)=>name==='__esModule'?false:String(name)});
const ClockTimeField=load('src/components/cart/ClockTimeField.tsx',{'@/lib/cart/scheduling':scheduling,'@/lib/cart/scheduling-copy':scheduleCopy,'./BookingExperience.module.css':{default:css}}).default;
function harness(path,props,mocks){let index=0,effects=[];const hooks=[];const same=(a,b)=>a&&b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));const react={...React,
 useState(initial){const i=index++;hooks[i]??={value:typeof initial==='function'?initial():initial};return [hooks[i].value,value=>{hooks[i].value=typeof value==='function'?value(hooks[i].value):value;}];},
 useRef(initial){const i=index++;hooks[i]??={value:{current:initial}};return hooks[i].value;},
 useMemo(fn,deps){const i=index++;if(!same(hooks[i]?.deps,deps))hooks[i]={value:fn(),deps};return hooks[i].value;},
 useEffect(fn,deps){const i=index++;if(!same(hooks[i]?.deps,deps)){hooks[i]?.cleanup?.();hooks[i]={deps};effects.push(()=>hooks[i].cleanup=fn());}}
};const Component=load(path,{react,'@/lib/cart/scheduling':scheduling,'@/lib/cart/scheduling-copy':scheduleCopy,'./ClockTimeField':{default:ClockTimeField},'@/components/cart/ClockTimeField':{default:ClockTimeField},'@/lib/cart/experience-copy':experience,'@/lib/cart/geolocation':geolocation,'./BookingExperience.module.css':css,'@/components/cart/BookingExperience.module.css':css,...mocks}).default;return {render(){index=0;const tree=Component(props);const pending=effects;effects=[];for(const run of pending)run();return tree;},dispose(){for(const hook of hooks)hook?.cleanup?.();}};}
function nodes(tree,predicate){if(tree==null||typeof tree==='boolean')return [];if(Array.isArray(tree))return tree.flatMap(t=>nodes(t,predicate));if(!React.isValidElement(tree))return [];return [...(predicate(tree)?[tree]:[]),...nodes(tree.props.children,predicate)];}
const label=node=>typeof node==='string'?node:Array.isArray(node)?node.map(label).join(''):React.isValidElement(node)?label(node.props.children):'';
const button=(tree,text)=>nodes(tree,n=>n.type==='button'&&label(n)===text)[0];
const flush=async()=>{for(let i=0;i<8;i++)await Promise.resolve();};
function setup(){const prior={localStorage:globalThis.localStorage,window:globalThis.window,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};globalThis.localStorage={getItem:()=>null};globalThis.window={scrollTo:()=>{}};globalThis.requestAnimationFrame=fn=>{fn();return 1;};globalThis.cancelAnimationFrame=()=>{};return()=>{globalThis.localStorage=prior.localStorage;globalThis.window=prior.window;globalThis.requestAnimationFrame=prior.requestAnimationFrame;globalThis.cancelAnimationFrame=prior.cancelAnimationFrame;};}
const options={items:[],providers:[{id:7,name:'Medical Co'}],addresses:[{id:4,label:'Home'}],minutes:15};
function cartHarness(value=options){const item={serviceId:10,quantity:1,name:'Test',unitHalalas:15000};const state={items:[item],completed:[]};let discovered=0;const props={locale:'en',identity:'patient'};const picker=()=>null;const h=harness('src/app/[locale]/cart/CartView.tsx',props,{
 '@/components/cart/BookingTimePicker':{default:picker},'@/components/cart/VisitAddressForm':{default:()=>null},
 '@/components/cart/store':{useServiceCart:()=>state,useCartReady:()=>true},
 '@/i18n/navigation':{Link:({children,...props})=>React.createElement('a',props,children)},
 '@/lib/cart/model':model,'@/lib/cart/availability-errors':availabilityErrors,'@/lib/cart/copy':copy,'@/lib/cart/booking-copy':booking,
 '@/components/cart/Cart.module.css':css,'./actions':{prepareCartAction:async()=>{discovered++;return {ok:true,value};}},
 });return {h,picker,discovered:()=>discovered};}
test('cart discovers matching providers but requires an explicit choice even for a sole provider',async()=>{const restore=setup();const {h,picker,discovered}=cartHarness();try{let tree=h.render();await flush();tree=h.render();assert.equal(discovered(),1);const select=nodes(tree,n=>n.type==='select')[0];assert.equal(select.props.value,0);assert.equal(button(tree,'Continue').props.disabled,true);assert.equal(nodes(select,n=>n.type==='option').length,2);select.props.onChange({target:{value:'7'}});tree=h.render();assert.equal(button(tree,'Continue').props.disabled,false);assert.ok(!renderToStaticMarkup(tree).includes('Booking Date &amp; Slot'));button(tree,'Continue').props.onClick();tree=h.render();const html=renderToStaticMarkup(tree);assert.ok(html.includes('Book Services'));assert.ok(html.includes('Your Address'));assert.ok(html.includes('Description'));assert.ok(html.includes('Choose Date &amp; Time'));assert.ok(!html.includes('Find available times'));button(tree,'Choose Date & Time').props.onClick();tree=h.render();const dialog=nodes(tree,n=>n.type===picker)[0];assert.equal(dialog.props.providerId,7);assert.equal(dialog.props.addressId,4);}finally{h.dispose();restore();}});
test('multiple providers require a choice before Continue, without requiring an address on the provider step',async()=>{const restore=setup();const {h}=cartHarness({...options,providers:[{id:7,name:'One'},{id:8,name:'Two'}],addresses:[]});try{h.render();await flush();let tree=h.render();assert.equal(button(tree,'Continue').props.disabled,true);const select=nodes(tree,n=>n.type==='select')[0];assert.equal(nodes(select,n=>n.type==='option').length,3);select.props.onChange({target:{value:'8'}});tree=h.render();assert.equal(button(tree,'Continue').props.disabled,false);button(tree,'Continue').props.onClick();tree=h.render();assert.equal(button(tree,'Choose Date & Time').props.disabled,true);assert.ok(renderToStaticMarkup(tree).includes('Save or select your visit address'));}finally{h.dispose();restore();}});
function slotHarness(action){let chosen;const h=harness('src/components/cart/BookingTimePicker.tsx',{lines:[{serviceId:10,quantity:1}],providerId:7,addressId:4,locale:'en',initialDate:model.todayInRiyadh(),onSelect:(...args)=>chosen=args,onClose:()=>{}},{'@/app/[locale]/cart/actions':{cartSlotsAction:async(...args)=>{const result=await action(...args);return result.ok?{...result,value:{schedulingMode:'configured_slots',requiresConfiguredSlot:true,timezone:'Asia/Riyadh',serverTime:null,...result.value}}:result;}},'@/lib/cart/availability-errors':availabilityErrors,'@/lib/cart/copy':copy,'@/lib/cart/booking-copy':booking,'@/lib/cart/model':model,'./Cart.module.css':css});return {h,chosen:()=>chosen};}
test('opening date/time fetches slots automatically and returns the selected backend time and price',async()=>{const calls=[],value={slots:['09:00','10:00'],minutes:15,amountHalalas:15200,priceLines:[]};const {h,chosen}=slotHarness(async(...args)=>{calls.push(args);return {ok:true,value};});try{let tree=h.render();assert.ok(renderToStaticMarkup(tree).includes('Loading available times'));await flush();tree=h.render();assert.equal(calls.length,1);assert.deepEqual(calls[0],[[{serviceId:10,quantity:1}],7,model.todayInRiyadh(),4]);assert.equal(button(tree,'Use selected time').props.disabled,true);button(tree,'10:00').props.onClick();tree=h.render();assert.equal(button(tree,'Use selected time').props.disabled,false);button(tree,'Use selected time').props.onClick();assert.deepEqual(chosen(),[model.todayInRiyadh(),'10:00',{schedulingMode:'configured_slots',requiresConfiguredSlot:true,timezone:'Asia/Riyadh',serverTime:null,...value}]);}finally{h.dispose();}});
test('changing dates clears old slots and ignores a late response for the previous date',async()=>{const pending=[];const {h}=slotHarness((...args)=>new Promise(resolve=>pending.push({args,resolve})));try{h.render();pending[0].resolve({ok:true,value:{slots:['09:00'],minutes:15,amountHalalas:15200,priceLines:[]}});await flush();let tree=h.render();button(tree,'09:00').props.onClick();tree=h.render();nodes(tree,n=>n.type==='input')[0].props.onChange({target:{value:model.todayInRiyadh(1)}});tree=h.render();assert.equal(button(tree,'09:00'),undefined);assert.equal(button(tree,'Use selected time').props.disabled,true);nodes(tree,n=>n.type==='input')[0].props.onChange({target:{value:model.todayInRiyadh(2)}});tree=h.render();pending[1].resolve({ok:true,value:{slots:['11:00'],minutes:15,amountHalalas:15200,priceLines:[]}});await flush();tree=h.render();assert.equal(button(tree,'11:00'),undefined);pending[2].resolve({ok:true,value:{slots:['12:00'],minutes:15,amountHalalas:15200,priceLines:[]}});await flush();tree=h.render();assert.ok(button(tree,'12:00'));assert.equal(button(tree,'Use selected time').props.disabled,true);}finally{h.dispose();}});
test('empty availability and backend coverage errors remain distinct',async()=>{for(const result of [{ok:true,value:{slots:[],minutes:15,amountHalalas:15200,priceLines:[]}},{ok:false,code:'ADDRESS_NOT_COVERED'}]){const {h}=slotHarness(async()=>result);try{h.render();await flush();const tree=h.render(),html=renderToStaticMarkup(tree);if(result.ok){assert.ok(html.includes('No times available on this date'));assert.equal(button(tree,'Retry'),undefined);}else{assert.ok(html.includes('not available at that address'));assert.ok(button(tree,'Retry'));assert.ok(!html.includes('No times available on this date'));}}finally{h.dispose();}}});


test('current location visibly selects a pin and fills an editable address label before saving',async()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'navigator');
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{geolocation:{getCurrentPosition:success=>success({coords:{latitude:24.75,longitude:46.7}})}}});
 const h=harness('src/components/cart/VisitAddressForm.tsx',{locale:'en',disabled:false,onSaved:()=>{},onBusyChange:()=>{}},{'@/app/[locale]/cart/actions':{},'@/lib/cart/booking-copy':booking,'@/lib/cart/availability-errors':availabilityErrors,'@/lib/cart/copy':copy,'./Cart.module.css':css});
 try{let tree=h.render();assert.equal(button(tree,'Save address').props.disabled,true);await button(tree,'Use Current Location').props.onClick();tree=h.render();assert.equal(nodes(tree,n=>n.props.name==='lat')[0].props.value,'24.750000');assert.equal(nodes(tree,n=>n.props.name==='long')[0].props.value,'46.700000');assert.equal(button(tree,'Save address').props.disabled,false);assert.ok(renderToStaticMarkup(tree).includes('Location captured'));assert.equal(nodes(tree,n=>n.props.name==='address')[0].props.value,'Current location');const map=nodes(tree,n=>n.type==='button'&&n.props['aria-label']==='Click the map to select your visit location.')[0];map.props.onClick({clientX:256,clientY:160,currentTarget:{getBoundingClientRect:()=>({left:0,top:0,width:512,height:320})}});tree=h.render();assert.equal(nodes(tree,n=>n.props.name==='lat')[0].props.value,'24.750000');assert.equal(nodes(tree,n=>n.props.name==='long')[0].props.value,'46.700000');}finally{h.dispose();if(prior)Object.defineProperty(globalThis,'navigator',prior);else delete globalThis.navigator;}
});


test('availability failures show the failed step and a safe request reference instead of hiding every error',async()=>{
 const diagnostic={stage:'selection',code:'D4H_UNAVAILABLE',status:500,requestId:'request-123'};
 const {h}=slotHarness(async()=>({ok:false,code:'D4H_UNAVAILABLE',diagnostic}));
 try{h.render();await flush();const html=renderToStaticMarkup(h.render());assert.ok(html.includes("price and address coverage could not be confirmed"));assert.ok(html.includes('Support details'));assert.ok(html.includes('selection / D4H_UNAVAILABLE / HTTP 500 / request-123'));assert.ok(!html.includes('No times available'));}finally{h.dispose();}
 assert.deepEqual(availabilityErrors.availabilityDiagnostic('selection','<raw error>',999,'token with spaces','private data'),{stage:'selection',code:'CHECKOUT_UNAVAILABLE'});
 assert.match(availabilityErrors.availabilityError({stage:'selection',code:'D4H_UNAVAILABLE',status:401},'en','fallback'),/Sign in again/);
 assert.match(availabilityErrors.availabilityError({stage:'response',code:'INVALID_RESPONSE',reason:'availability.slots'},'en','fallback'),/response could not be read/);
});

test('server availability errors retain stage, HTTP status and request ID without returning backend messages or submitted data',async()=>{
 class ApiError extends Error{constructor(){super('private backend text');this.code='D4H_UNAVAILABLE';this.status=500;this.requestId='request-123';}}
 class CartError extends Error{}
 const logs=[],prior=console.error;console.error=(...args)=>logs.push(args);
 try{
 const api=load('src/app/[locale]/cart/actions.ts',{
  'next-intl/server':{getLocale:async()=> 'en'},'next/navigation':{unstable_rethrow:()=>{}},
  '@/lib/cart/availability-errors':availabilityErrors,
  '@/lib/api/d4h/cart':{CartError,cartSlots:async(_lines,_provider,_date,_locale,_address,onStage)=>{onStage('selection');throw new ApiError();}},
  '@/lib/api/d4h/v2':{D4hV2Error:ApiError},
 });
 const result=await api.cartSlotsAction([{serviceId:10,quantity:1}],7,model.todayInRiyadh(),4);
 assert.equal(result.ok,false);assert.deepEqual(result.diagnostic,{stage:'selection',code:'D4H_UNAVAILABLE',status:500,requestId:'request-123'});
 assert.equal(logs.length,1);assert.ok(!JSON.stringify([result,logs]).includes('private backend text'));assert.ok(!JSON.stringify(logs).includes('serviceId'));
 }finally{console.error=prior;}
});


test('location lookup retries without high accuracy when the device cannot provide a precise fix',async()=>{
 const calls=[];const point=await geolocation.locateVisit({getCurrentPosition(success,failure,options){calls.push(options);if(calls.length===1)failure({code:2});else success({coords:{latitude:24.7,longitude:46.6,accuracy:80}});}});
 assert.deepEqual(calls.map(c=>c.enableHighAccuracy),[true,false]);assert.deepEqual(point,{lat:24.7,long:46.6,accuracy:80});
});
test('location permission denial is not retried and blocked or insecure contexts produce clear error codes',async()=>{
 let count=0;await assert.rejects(()=>geolocation.locateVisit({getCurrentPosition(_success,failure){count++;failure({code:1});}}),error=>error.code==='denied');assert.equal(count,1);
 await assert.rejects(()=>geolocation.locateVisit(undefined),error=>error.code==='unavailable');
 await assert.rejects(()=>geolocation.locateVisit(undefined,false),error=>error.code==='insecure');
 await assert.rejects(()=>geolocation.locateVisit({getCurrentPosition(_success,failure){failure({code:3});}}),error=>error.code==='timeout');
});
test('denied location permission displays actionable browser guidance while leaving map selection usable',async()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{geolocation:{getCurrentPosition(_success,failure){failure({code:1});}}}});
 const h=harness('src/components/cart/VisitAddressForm.tsx',{locale:'en',disabled:false,onSaved:()=>{},onBusyChange:()=>{}},{'@/app/[locale]/cart/actions':{},'@/lib/cart/booking-copy':booking,'@/lib/cart/copy':copy,'./Cart.module.css':css});
 try{let tree=h.render();await button(tree,'Use Current Location').props.onClick();tree=h.render();const html=renderToStaticMarkup(tree);assert.ok(html.includes('Location access is blocked'));assert.ok(html.includes('browser address bar'));assert.equal(button(tree,'Save address').props.disabled,true);button(tree,'Choose from map').props.onClick();tree=h.render();assert.ok(nodes(tree,n=>n.props['aria-label']==='Click the map to select your visit location.').length);}finally{h.dispose();if(prior)Object.defineProperty(globalThis,'navigator',prior);else delete globalThis.navigator;}
});


test('clock-picker mode allows an arbitrary future minute with empty configured slots and shows the returned timezone',async()=>{
 const value={slots:[],schedulingMode:'clock_picker',requiresConfiguredSlot:false,timezone:'UTC',serverTime:new Date().toISOString(),minutes:15,amountHalalas:15200,priceLines:[]};
 const {h,chosen}=slotHarness(async()=>({ok:true,value}));
 try{h.render();await flush();let tree=h.render();assert.ok(renderToStaticMarkup(tree).includes('type="time"'));assert.ok(renderToStaticMarkup(tree).includes('Booking timezone: UTC'));assert.ok(!renderToStaticMarkup(tree).includes('No times available'));const tomorrow=scheduling.todayInTimezone('UTC',1);nodes(tree,n=>n.type==='input'&&n.props.type==='date')[0].props.onChange({target:{value:tomorrow}});tree=h.render();await flush();tree=h.render();const field=nodes(tree,n=>n.type===ClockTimeField)[0];nodes(ClockTimeField(field.props),n=>n.type==='input')[0].props.onChange({target:{value:'10:17'}});tree=h.render();assert.equal(button(tree,'Use selected time').props.disabled,false);button(tree,'Use selected time').props.onClick();assert.equal(chosen()[0],tomorrow);assert.equal(chosen()[1],'10:17');assert.equal(chosen()[2].timezone,'UTC');}finally{h.dispose();}
});
test('clock-picker mode rejects a past local time using server time rather than the browser timezone',async()=>{
 const value={slots:[],schedulingMode:'clock_picker',requiresConfiguredSlot:false,timezone:'UTC',serverTime:new Date().toISOString(),minutes:15,amountHalalas:15200,priceLines:[]};
 const {h}=slotHarness(async()=>({ok:true,value}));
 try{h.render();await flush();let tree=h.render();nodes(tree,n=>n.type==='input'&&n.props.type==='date')[0].props.onChange({target:{value:scheduling.todayInTimezone('UTC')}});tree=h.render();await flush();tree=h.render();const field=nodes(tree,n=>n.type===ClockTimeField)[0];field.props.onChange('00:00');tree=h.render();assert.equal(button(tree,'Use selected time').props.disabled,true);assert.ok(renderToStaticMarkup(tree).includes('Choose a future date and time'));}finally{h.dispose();}
});


test('normal service UI accepts an arbitrary clock time with no slots and retains its provider for preview',async()=>{
 const restore=setup(),calls=[];
 const schedule={slots:[],schedulingMode:'clock_picker',requiresConfiguredSlot:false,timezone:'UTC',serverTime:'2030-06-15T08:00:00Z'};
 const h=harness('src/app/[locale]/provider/[id]/book/BookingFlow.tsx',{provider:{id:67,name:'Provider'},services:[{id:10,name:'Service',minutes:15}],addresses:[{id:3,label:'Home'}],identity:{name:'Patient',phone:'+966500000000',email:''}}, {
 'next-intl':{useLocale:()=> 'en',useTranslations:()=>key=>key},'@/i18n/use-ui-text':{useUiText:()=>x=>x},'@/i18n/navigation':{Link:({children,...p})=>React.createElement('a',p,children)},'./booking.module.css':css,
 './booking-api':{homeSlotsAction:async(...args)=>{calls.push(args);return schedule;},previewHomeAction:async input=>{calls.push(input);return {ok:true,quote:{token:'quote',amountHalalas:15200}};}}
 });
 try{h.render();await flush();h.render();let tree=h.render();assert.ok(renderToStaticMarkup(tree).includes('June 2030'));button(tree,'today').props.onClick();h.render();await flush();h.render();tree=h.render();const clock=nodes(tree,n=>n.type===ClockTimeField)[0];assert.ok(clock);clock.props.onChange('10:17');tree=h.render();assert.equal(button(tree,'continue').props.disabled,false);button(tree,'continue').props.onClick();tree=h.render();await button(tree,'Review price').props.onClick();tree=h.render();assert.equal(calls.at(-1).providerId,67);assert.equal(calls.at(-1).addressId,3);assert.equal(calls.at(-1).date,'2030-06-15');assert.equal(calls.at(-1).time,'10:17');assert.ok(renderToStaticMarkup(tree).includes('UTC'));}finally{h.dispose();restore();}
});
