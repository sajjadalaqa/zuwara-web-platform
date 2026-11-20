"use server";
import {availabilityDiagnostic,type AvailabilityStage,type CoverageContext} from "@/lib/cart/availability-errors";
import { getLocale } from "next-intl/server";
import { unstable_rethrow } from "next/navigation";
import { CartError, prepareCart, cartSlots, previewCart, createCart, payCart, resumeCart, type CartInput } from "@/lib/api/d4h/cart";
import { D4hV2Error } from "@/lib/api/d4h/v2";
async function action<T>(run:(locale:string)=>Promise<T>,creating=false,stage?:()=>AvailabilityStage,coverage?:()=>CoverageContext|undefined) {
  try {return {ok:true as const,value:await run(await getLocale())};}
  catch(error){unstable_rethrow(error);const code=error instanceof CartError?error.code:error instanceof D4hV2Error?error.code:"CHECKOUT_UNAVAILABLE";
    const rejected=error instanceof D4hV2Error&&(error.status===422||["SLOT_UNAVAILABLE","INVALID_ADDRESS","SERVICE_UNAVAILABLE","ADDRESS_OUTSIDE_ZONE"].includes(error.code));
    const diagnostic=stage?availabilityDiagnostic(stage(),code,error instanceof D4hV2Error?error.status:undefined,error instanceof D4hV2Error?error.requestId:undefined,error instanceof CartError?error.reason:undefined,error instanceof D4hV2Error?error.validationFields:undefined,coverage?.()):undefined;
    if(diagnostic)console.error("[service-checkout] "+JSON.stringify(diagnostic));
    return {ok:false as const,code,uncertain:creating&&!rejected,...(diagnostic?{diagnostic}:{})};}
}
export async function prepareCartAction(lines:unknown){return action(locale=>prepareCart(lines,locale));}
export async function cartSlotsAction(lines:unknown,providerId:number,date:string,addressId:number){let stage:AvailabilityStage="request",coverage:CoverageContext|undefined;return action(locale=>cartSlots(lines,providerId,date,locale,addressId,(value,context)=>{stage=value;if(context)coverage=context;}),false,()=>stage,()=>coverage);}
export async function previewCartAction(input:CartInput){return action(locale=>previewCart(input,locale));}
export async function createCartAction(token:string){return action(locale=>createCart(token,locale),true);}
export async function payCartAction(receipt:string){return action(locale=>payCart(receipt,locale));}

export async function resumeCartAction(receipt:string){return action(()=>resumeCart(receipt));}

export async function saveCartAddressAction(fd:FormData){return action(async()=>{
 const {addressBody}=await import("@/lib/api/patient-dashboard");
 const {d4hPatientApi}=await import("@/lib/api/d4h/patient");
 const {homeAddresses}=await import("@/lib/api/d4h/bookings");
 await d4hPatientApi("/patients/addresses",{method:"POST",body:addressBody(fd)});
 return homeAddresses();
});}
