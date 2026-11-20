import "server-only";
import {bookingSchedule,calendarDate,type BookingSchedule} from "@/lib/cart/scheduling";
import { cache } from "react";
import { randomUUID } from "node:crypto";
import { d4hV2 } from "./v2";
import { d4hPatientApi } from "./patient";
import { requireSession } from "@/lib/auth/session";
import { seal, unseal } from "@/lib/auth/seal";
import {addressLocationState,type AddressLocationState} from "@/lib/cart/address-location";
import { visitMinutes } from "@/lib/cart/model";
import { pagination, halalas } from "@/lib/api/pagination";
export type HomeService = { id: number; name: string; nameAr?: string; minutes: number };
export type HomeAddress = { id: number; label: string; zoneId?: number; locationState?:AddressLocationState };
export type HomeInput = { providerId: number; serviceId: number; addressId: number; date: string; time: string; notes: string };
type Body = { provider_id: number; address_id: number; zone_id?: number; date: string; time: string; services: { service_id: number; quantity: number }[]; description: string };
export type HomeGroup = { id: string; amountHalalas: number; paid: boolean };
export const homeServices = cache(async (providerId: number): Promise<HomeService[]> => {
  if (!Number.isSafeInteger(providerId) || providerId < 1) throw new Error("Invalid provider.");
  const rows: HomeService[] = [], seen = new Set<number>();
  for (let page=1;page<=100;page++) {
    const payload = await d4hV2<{ id: number; name: string; name_ar: string | null; duration: string; visit_type: string; provider?:{id:number}|null; is_global?:boolean }[]>("/catalog/services?" + new URLSearchParams({provider_id:String(providerId),per_page:"50",page:String(page)}));
    const p = pagination(payload); let added=0;
    for (const row of payload.data) {
      if (seen.has(row.id)) continue; seen.add(row.id); added++;
      if (!["on_site","home"].includes(row.visit_type) || row.is_global===true || row.provider===null || (row.provider && row.provider.id!==providerId)) continue;
      if (!Number.isSafeInteger(row.id) || !row.name) throw new Error("Invalid home service.");
      const minutes=visitMinutes(row.duration);
      rows.push({id:row.id,name:row.name,nameAr:row.name_ar??undefined,minutes});
    }
    if (!p.has_more) return rows;
    if (!added) throw new Error("Invalid catalog pagination.");
  }
  throw new Error("Home service limit exceeded.");
});
export async function homeAddresses(): Promise<HomeAddress[]> {
  const { data } = await d4hPatientApi<{ id: number; address?: string; zone_id?: number|string; lat?:unknown;long?:unknown;latitude?:unknown;longitude?:unknown }[]>("/patients/addresses");
  if (!Array.isArray(data)) throw new Error("Invalid saved addresses.");
  return data.map(row=>{
    if (!Number.isSafeInteger(row.id) || row.id<1) throw new Error("Invalid saved address.");
    const zoneId=typeof row.zone_id==="string"&&/^[1-9]\d*$/.test(row.zone_id)?Number(row.zone_id):row.zone_id;
    return { locationState:addressLocationState(row),id:row.id,label:typeof row.address==="string"&&row.address.trim()?row.address:"Saved address #"+row.id,
      ...(Number.isSafeInteger(zoneId)&&Number(zoneId)>0?{zoneId:Number(zoneId)}:{}) };
  });
}
export async function homeSlots(providerId: number, serviceId: number, date: string):Promise<BookingSchedule> {
  await requireSession();
  if (!calendarDate(date)) throw new Error("Invalid visit date.");
  const service=(await homeServices(providerId)).find(s=>s.id===serviceId);
  if (!service) throw new Error("Service unavailable.");
  const { data }=await d4hPatientApi<unknown>("/providers/"+providerId+"/availability?"+new URLSearchParams({date,duration_minutes:String(service.minutes)}));
  return bookingSchedule(data);
}
function secret(){const value=process.env.NEXT_SERVER_SESSION_SECRET;if(!value||value.length<32)throw new Error("Missing session secret.");return value;}
async function body(input: HomeInput): Promise<Body> {
  if (!Number.isSafeInteger(input.providerId)||!Number.isSafeInteger(input.serviceId)||!Number.isSafeInteger(input.addressId)||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time)||typeof input.notes!=="string"||input.notes.length>4000)throw new Error("Invalid visit.");
  const [services,addresses]=await Promise.all([homeServices(input.providerId),homeAddresses()]);
  const address=addresses.find(a=>a.id===input.addressId);
  if (!address || !services.some(s=>s.id===input.serviceId)) throw new Error("Visit selection is unavailable.");
  return {provider_id:input.providerId,address_id:address.id,
    date:input.date,time:input.time,services:[{service_id:input.serviceId,quantity:1}],description:input.notes.trim()};
}
type Intent={identity:string;body:Body;key:string;expires:number};
export async function previewHome(input: HomeInput) {
  const {user}=await requireSession(),selection=await body(input);
  const {data}=await d4hPatientApi<{total_halalas:number;currency:string}>("/bookings/preview",{method:"POST",body:selection});
  if(data.currency!=="SAR")throw new Error("Invalid visit currency.");
  const amount=halalas(data.total_halalas);
  const intent:Intent={identity:user.id,body:selection,key:randomUUID(),expires:Date.now()+30*60_000};
  return {token:seal(intent,secret(),"zuwara_home_booking"),amountHalalas:amount};
}
export async function createHome(token: string): Promise<HomeGroup> {
  const {user}=await requireSession();
  if(typeof token!=="string"||token.length>15000)throw new Error("Invalid visit quote.");
  const intent=unseal<Intent>(token,secret(),"zuwara_home_booking");
  if(!intent||intent.identity!==user.id||intent.expires<Date.now())throw new Error("Visit quote expired.");
  const {data}=await d4hPatientApi<{booking_group_id:string;quote:{total_halalas:number;currency:string};payment_state:string}>("/bookings",{method:"POST",body:intent.body,idempotencyKey:intent.key});
  if(!/^[a-f0-9-]{36}$/i.test(data.booking_group_id)||data.quote?.currency!=="SAR")throw new Error("Invalid visit confirmation.");
  return{id:data.booking_group_id,amountHalalas:halalas(data.quote.total_halalas),paid:data.payment_state==="paid"};
}
export async function payHome(id: string): Promise<boolean> {
  if(!/^[a-f0-9-]{36}$/i.test(id))throw new Error("Invalid visit group.");
  const {data}=await d4hPatientApi<{payment_state:string}>("/bookings/groups/"+id+"/pay",{method:"POST",body:{}});
  return data.payment_state==="paid";
}

