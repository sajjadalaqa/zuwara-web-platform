"use server";
import { getLocale } from "next-intl/server";
import { unstable_rethrow } from "next/navigation";
import { CartError, prepareCart, cartSlots, previewCart, createCart, payCart, resumeCart, type CartInput } from "@/lib/api/d4h/cart";
import { D4hV2Error } from "@/lib/api/d4h/v2";
async function action<T>(run:(locale:string)=>Promise<T>,creating=false) {
  try {return {ok:true as const,value:await run(await getLocale())};}
  catch(error){unstable_rethrow(error);const code=error instanceof CartError?error.code:error instanceof D4hV2Error?error.code:"CHECKOUT_UNAVAILABLE";
    const rejected=error instanceof D4hV2Error&&(error.status===422||["SLOT_UNAVAILABLE","INVALID_ADDRESS","SERVICE_UNAVAILABLE","ADDRESS_OUTSIDE_ZONE"].includes(error.code));
    return {ok:false as const,code,uncertain:creating&&!rejected};}
}
export async function prepareCartAction(lines:unknown){return action(locale=>prepareCart(lines,locale));}
export async function cartSlotsAction(lines:unknown,providerId:number,date:string){return action(locale=>cartSlots(lines,providerId,date,locale));}
export async function previewCartAction(input:CartInput){return action(locale=>previewCart(input,locale));}
export async function createCartAction(token:string){return action(locale=>createCart(token,locale),true);}
export async function payCartAction(receipt:string){return action(locale=>payCart(receipt,locale));}

export async function resumeCartAction(receipt:string){return action(()=>resumeCart(receipt));}
