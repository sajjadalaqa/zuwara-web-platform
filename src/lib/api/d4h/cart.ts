import "server-only";
import {bookingSchedule,calendarDate,type BookingSchedule} from "@/lib/cart/scheduling";
import type { AvailabilityStage,CoverageContext } from "@/lib/cart/availability-errors";
import { randomUUID } from "node:crypto";
import { d4hV2 } from "./v2";
import { d4hPatientApi } from "./patient";
import { getD4hProviders } from "./providers";
import { homeAddresses,type HomeAddress } from "./bookings";
import { requireSession } from "@/lib/auth/session";
import { seal, unseal } from "@/lib/auth/seal";
import { halalas } from "@/lib/api/pagination";
import { cartSelection, moneyHalalas, visitMinutes, type CartSelection } from "@/lib/cart/model";
export type CheckoutItem = CartSelection & { name:string; nameAr?:string; unitHalalas:number; minutes:number };
export type CartOptions = { items:CheckoutItem[]; providers:{id:number;name:string;image?:string;rating?:number}[]; addresses:HomeAddress[]; minutes:number };
export type CartInput = { lines:CartSelection[]; providerId:number; addressId:number; date:string; time:string; notes:string };
export type CartPriceLine={name:string;quantity:number;unitHalalas:number;subtotalHalalas:number;taxHalalas:number;totalHalalas:number};
export type CartAvailability=BookingSchedule&{minutes:number;amountHalalas:number;priceLines:CartPriceLine[];resolvedZoneId?:number};
export type CartQuote = { token:string; amountHalalas:number; expiresAt:number; priceLines:CartPriceLine[];resolvedZoneId?:number };
function priceLines(value:unknown):CartPriceLine[]{
 if(value===undefined)return [];
 if(!Array.isArray(value))throw new CartError("INVALID_RESPONSE","quote.lines");
 return value.map(row=>{if(!row||typeof row.name!=="string"||!Number.isSafeInteger(row.quantity)||row.quantity<1)throw new CartError("INVALID_RESPONSE","quote.lines.quantity");return {name:row.name,quantity:row.quantity,unitHalalas:halalas(row.unit_halalas),subtotalHalalas:halalas(row.subtotal_halalas),taxHalalas:halalas(row.tax_halalas),totalHalalas:halalas(row.total_halalas)};});
}
export type CartGroup = { id:string; amountHalalas:number; paid:boolean; receipt:string };
type Visit = {packages?:{package_id:number;quantity:number}[];provider_id:number;address_id:number;zone_id?:number;date:string;time:string;services?:{service_id:number;quantity:number}[];description:string};
type Intent = { identity:string; body:Visit; key:string; expires:number };
export function bookingSelection(lines:CartSelection[]){
 const services=lines.flatMap(i=>i.serviceId!==undefined?[{service_id:i.serviceId,quantity:i.quantity}]:[]);
 const packages=lines.flatMap(i=>i.packageId!==undefined?[{package_id:i.packageId,quantity:i.quantity}]:[]);
 return {...(services.length?{services}:{}),...(packages.length?{packages}:{})};
}
export class CartError extends Error { constructor(public code:string,public reason?:string){super(code);} }
const id=(n:unknown):n is number=>Number.isSafeInteger(n)&&Number(n)>0;
function selection(value:unknown) { try {return cartSelection(value);} catch {throw new CartError("INVALID_CART");} }
function secret(){const value=process.env.NEXT_SERVER_SESSION_SECRET;if(!value||value.length<32)throw new CartError("CHECKOUT_UNAVAILABLE");return value;}
function dateValue(value:string){if(!calendarDate(value))throw new CartError("INVALID_DATE");return value;}
async function catalog(lines:CartSelection[],locale:string):Promise<CheckoutItem[]> {
  const items:CheckoutItem[]=[];
  // Bound parallel requests to respect public catalogue rate limits.
  for(let offset=0;offset<lines.length;offset+=4){const batch=await Promise.all(lines.slice(offset,offset+4).map(async line=>{
    const {data}=await d4hV2<{id:number;name:string;name_ar?:string;duration?:string;visit_type?:string;catalog_price?:string;catalog_price_halalas?:number;currency?:string;provider?:{id:number}|null;price?:{currency:string;final:string;final_halalas?:number}}>("/catalog/"+(line.packageId!==undefined?"packages/"+line.packageId:"services/"+line.serviceId),{locale});
    if(!data||data.id!==(line.packageId??line.serviceId)||typeof data.name!=="string"||!data.name.trim()||!!data.provider||((data.currency??data.price?.currency??"SAR")!=="SAR"))throw new CartError("SERVICE_UNAVAILABLE");
    const amount=data.catalog_price_halalas??data.price?.final_halalas??moneyHalalas(data.catalog_price??data.price?.final);
    if(!Number.isSafeInteger(amount)||Number(amount)<0)throw new CartError("SERVICE_UNAVAILABLE");
    let minutes=0;if(data.duration!==undefined){try{minutes=visitMinutes(data.duration);}catch{throw new CartError("SERVICE_UNAVAILABLE");}}
    return {...line,name:data.name,nameAr:data.name_ar,unitHalalas:Number(amount),minutes};
  }));items.push(...batch);}
  // Provider selection preview validates the actual visit duration.
  return items;
}
export async function prepareCart(value:unknown,locale:string):Promise<CartOptions> {
  await requireSession();const lines=selection(value),items=await catalog(lines,locale);
  const providers=await getD4hProviders(locale,{serviceIds:lines.flatMap(i=>i.serviceId!==undefined?[i.serviceId]:[]),packageIds:lines.flatMap(i=>i.packageId!==undefined?[i.packageId]:[])});
  return {items,providers,addresses:await homeAddresses(),minutes:items.reduce((sum,i)=>sum+i.minutes*i.quantity,0)};
}
export async function cartSlots(value:unknown,providerId:number,date:string,locale:string,addressId:number,onStage?:(stage:AvailabilityStage,coverage?:CoverageContext)=>void):Promise<CartAvailability> {
  await requireSession();if(!id(providerId))throw new CartError("INVALID_PROVIDER");dateValue(date);
  const lines=selection(value);
  if(!id(addressId))throw new CartError("INVALID_ADDRESS");
  onStage?.("address");
  const address=(await homeAddresses()).find(a=>a.id===addressId);if(!address)throw new CartError("INVALID_ADDRESS");
  onStage?.("selection",{providerId,addressId:address.id,zoneId:address.zoneId??null,locationState:address.locationState??"coordinates-not-returned"});
  const {data:quote}=await d4hPatientApi<{duration_minutes:number;total_halalas:number;currency:string;lines?:unknown;zone_id?:number}>("/bookings/selection-preview",{method:"POST",locale,body:{provider_id:providerId,address_id:address.id,...bookingSelection(lines)}});
  const minutes=quote?.duration_minutes;
  if(!Number.isSafeInteger(minutes)||minutes<1||minutes>480)throw new CartError("INVALID_RESPONSE","quote.duration_minutes");
  if(quote.currency!=="SAR")throw new CartError("INVALID_RESPONSE","quote.currency");
  let amountHalalas:number;try{amountHalalas=halalas(quote.total_halalas);}catch{throw new CartError("INVALID_RESPONSE","quote.total_halalas");}
  onStage?.("schedule");
  const {data}=await d4hPatientApi<unknown>("/providers/"+providerId+"/availability?"+new URLSearchParams({date,duration_minutes:String(minutes)}),{locale});
  onStage?.("response");
  let schedule:BookingSchedule;try{schedule=bookingSchedule(data);}catch(error){throw new CartError("INVALID_RESPONSE",error instanceof Error?error.message:"availability.response");}
  return {...schedule,minutes,amountHalalas,priceLines:priceLines(quote.lines),...(Number.isSafeInteger(quote.zone_id)&&Number(quote.zone_id)>0?{resolvedZoneId:quote.zone_id}:{})};
}
export async function previewCart(input:CartInput,locale:string):Promise<CartQuote> {
  const {user}=await requireSession();const lines=selection(input?.lines);
  if(!id(input?.providerId)||!id(input?.addressId)||typeof input.notes!=="string"||input.notes.length>2000||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time))throw new CartError("INVALID_CART");dateValue(input.date);
  await catalog(lines,locale);const address=(await homeAddresses()).find(a=>a.id===input.addressId);if(!address)throw new CartError("INVALID_ADDRESS");
  const body:Visit={provider_id:input.providerId,address_id:address.id,date:input.date,time:input.time,...bookingSelection(lines),description:input.notes.trim()};
  const {data}=await d4hPatientApi<{currency:string;total_halalas:number;lines?:unknown;zone_id?:number}>("/bookings/preview",{method:"POST",body,locale});if(data.currency!=="SAR")throw new CartError("INVALID_RESPONSE");
  const amountHalalas=halalas(data.total_halalas),expiresAt=Date.now()+30*60_000;
  return {token:seal({identity:user.id,body,key:randomUUID(),expires:expiresAt} satisfies Intent,secret(),"zuwara_cart_booking"),amountHalalas,expiresAt,priceLines:priceLines(data.lines),...(Number.isSafeInteger(data.zone_id)&&Number(data.zone_id)>0?{resolvedZoneId:data.zone_id}:{})};
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
