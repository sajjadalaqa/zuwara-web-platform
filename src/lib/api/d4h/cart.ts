import "server-only";
import { randomUUID } from "node:crypto";
import { d4hV2 } from "./v2";
import { d4hPatientApi } from "./patient";
import { getD4hProviders } from "./providers";
import { homeAddresses } from "./bookings";
import { requireSession } from "@/lib/auth/session";
import { seal, unseal } from "@/lib/auth/seal";
import { halalas } from "@/lib/api/pagination";
import { cartSelection, moneyHalalas, visitMinutes, todayInRiyadh, type CartSelection } from "@/lib/cart/model";
export type CheckoutItem = CartSelection & { name:string; nameAr?:string; unitHalalas:number; minutes:number };
export type CartOptions = { items:CheckoutItem[]; providers:{id:number;name:string}[]; addresses:{id:number;label:string;zoneId?:number}[]; minutes:number };
export type CartInput = { lines:CartSelection[]; providerId:number; addressId:number; date:string; time:string; notes:string };
export type CartQuote = { token:string; amountHalalas:number; expiresAt:number };
export type CartGroup = { id:string; amountHalalas:number; paid:boolean; receipt:string };
type Visit = {provider_id:number;address_id:number;zone_id?:number;date:string;time:string;services:{service_id:number;quantity:number}[];description:string};
type Intent = { identity:string; body:Visit; key:string; expires:number };
export class CartError extends Error { constructor(public code:string){super(code);} }
const id=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>0;
function selection(value:unknown) { try {return cartSelection(value);} catch {throw new CartError("INVALID_CART");} }
function secret(){const value=process.env.NEXT_SERVER_SESSION_SECRET;if(!value||value.length<32)throw new CartError("CHECKOUT_UNAVAILABLE");return value;}
function dateValue(value:string) { if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value+"T00:00:00Z"))||new Date(value+"T00:00:00Z").toISOString().slice(0,10)!==value||value<todayInRiyadh()||value>todayInRiyadh(60))throw new CartError("INVALID_DATE");return value; }
async function catalog(lines:CartSelection[],locale:string):Promise<CheckoutItem[]> {
  const items:CheckoutItem[]=[];
  // Bound parallel requests to respect public catalogue rate limits.
  for(let offset=0;offset<lines.length;offset+=4){const batch=await Promise.all(lines.slice(offset,offset+4).map(async line=>{
    const {data}=await d4hV2<{id:number;name:string;name_ar?:string;duration:string;visit_type:string;price?:{currency:string;final:string;final_halalas?:number}}>("/catalog/services/"+line.serviceId,{locale});
    if(!data||data.id!==line.serviceId||typeof data.name!=="string"||!data.name.trim()||!["home","on_site"].includes(data.visit_type)||data.price?.currency!=="SAR")throw new CartError("SERVICE_UNAVAILABLE");
    const amount=data.price.final_halalas??moneyHalalas(data.price.final);
    if(!Number.isSafeInteger(amount)||Number(amount)<0)throw new CartError("SERVICE_UNAVAILABLE");
    let minutes:number;try{minutes=visitMinutes(data.duration);}catch{throw new CartError("SERVICE_UNAVAILABLE");}
    return {...line,name:data.name,nameAr:data.name_ar,unitHalalas:Number(amount),minutes};
  }));items.push(...batch);}
  const duration=items.reduce((sum,i)=>sum+i.minutes*i.quantity,0);
  if(duration>480)throw new CartError("VISIT_TOO_LONG");
  return items;
}
export async function prepareCart(value:unknown,locale:string):Promise<CartOptions> {
  await requireSession();const lines=selection(value),items=await catalog(lines,locale);
  let providers:{id:number;name:string}[]|null=null;
  for(let offset=0;offset<lines.length;offset+=4){const lists=await Promise.all(lines.slice(offset,offset+4).map(i=>getD4hProviders(locale,i.serviceId)));for(const list of lists){const ids=new Set(list.map(p=>p.id));providers=providers===null?list.map(p=>({id:p.id,name:p.name})):providers.filter(p=>ids.has(p.id));}}
  return {items,providers:providers??[],addresses:await homeAddresses(),minutes:items.reduce((sum,i)=>sum+i.minutes*i.quantity,0)};
}
export async function cartSlots(value:unknown,providerId:number,date:string,locale:string):Promise<string[]> {
  await requireSession();if(!id(providerId))throw new CartError("INVALID_PROVIDER");dateValue(date);
  const items=await catalog(selection(value),locale),minutes=items.reduce((sum,i)=>sum+i.minutes*i.quantity,0);
  const {data}=await d4hPatientApi<{slots:(string|{start_time?:string;time?:string})[]}>("/providers/"+providerId+"/availability?"+new URLSearchParams({date,duration_minutes:String(minutes)}),{locale});
  if(!Array.isArray(data.slots))throw new CartError("INVALID_RESPONSE");
  return [...new Set(data.slots.map(slot=>{const value=typeof slot==="string"?slot:slot.start_time??slot.time;if(!value||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value))throw new CartError("INVALID_RESPONSE");return value;}))];
}
export async function previewCart(input:CartInput,locale:string):Promise<CartQuote> {
  const {user}=await requireSession();const lines=selection(input?.lines);
  if(!id(input?.providerId)||!id(input?.addressId)||typeof input.notes!=="string"||input.notes.length>2000||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time))throw new CartError("INVALID_CART");dateValue(input.date);
  await catalog(lines,locale);const address=(await homeAddresses()).find(a=>a.id===input.addressId);if(!address)throw new CartError("INVALID_ADDRESS");
  const body:Visit={provider_id:input.providerId,address_id:address.id,...(address.zoneId?{zone_id:address.zoneId}:{}),date:input.date,time:input.time,services:lines.map(i=>({service_id:i.serviceId,quantity:i.quantity})),description:input.notes.trim()};
  const {data}=await d4hPatientApi<{currency:string;total_halalas:number}>("/bookings/preview",{method:"POST",body,locale});if(data.currency!=="SAR")throw new CartError("INVALID_RESPONSE");
  const amountHalalas=halalas(data.total_halalas),expiresAt=Date.now()+30*60_000;
  return {token:seal({identity:user.id,body,key:randomUUID(),expires:expiresAt} satisfies Intent,secret(),"zuwara_cart_booking"),amountHalalas,expiresAt};
}
export async function createCart(token:string,locale:string):Promise<CartGroup> {
  const {user}=await requireSession();if(typeof token!=="string"||token.length>25000)throw new CartError("INVALID_QUOTE");
  const intent=unseal<Intent>(token,secret(),"zuwara_cart_booking");if(!intent||intent.identity!==user.id||intent.expires<Date.now())throw new CartError("EXPIRED_QUOTE");
  const {data}=await d4hPatientApi<{booking_group_id:string;quote:{total_halalas:number;currency:string};payment_state:string}>("/bookings",{method:"POST",body:intent.body,idempotencyKey:intent.key,locale});
  if(!/^[a-f0-9-]{36}$/i.test(data.booking_group_id)||data.quote?.currency!=="SAR")throw new CartError("INVALID_RESPONSE");
  return {id:data.booking_group_id,amountHalalas:halalas(data.quote.total_halalas),paid:data.payment_state==="paid",receipt:seal({identity:user.id,groupId:data.booking_group_id,amountHalalas:halalas(data.quote.total_halalas)},secret(),"zuwara_cart_payment")};
}
export async function payCart(receipt:string,locale:string):Promise<boolean> {
  const {user}=await requireSession();if(typeof receipt!=="string"||receipt.length>2000)throw new CartError("INVALID_QUOTE");
  const claim=unseal<{identity:string;groupId:string}>(receipt,secret(),"zuwara_cart_payment");if(!claim||claim.identity!==user.id||!/^[a-f0-9-]{36}$/i.test(claim.groupId))throw new CartError("INVALID_QUOTE");
  const {data}=await d4hPatientApi<{payment_state:string}>("/bookings/groups/"+claim.groupId+"/pay",{method:"POST",body:{},locale});return data.payment_state==="paid";
}

export async function resumeCart(receipt:string):Promise<CartGroup>{const {user}=await requireSession();if(typeof receipt!=="string"||receipt.length>2000)throw new CartError("INVALID_QUOTE");const claim=unseal<{identity:string;groupId:string;amountHalalas:number}>(receipt,secret(),"zuwara_cart_payment");if(!claim||claim.identity!==user.id||!/^[a-f0-9-]{36}$/i.test(claim.groupId))throw new CartError("INVALID_QUOTE");return {id:claim.groupId,amountHalalas:halalas(claim.amountHalalas),paid:false,receipt};}
