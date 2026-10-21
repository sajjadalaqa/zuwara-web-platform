"use server";
import { homeSlots, previewHome, createHome, payHome, type HomeInput } from "@/lib/api/d4h/bookings";
import { D4hV2Error } from "@/lib/api/d4h/v2";
export async function homeSlotsAction(providerId:number,serviceId:number,date:string){return homeSlots(providerId,serviceId,date);}
export async function previewHomeAction(input:HomeInput){
  try{return{ok:true as const,quote:await previewHome(input)};}catch(error){if(error instanceof D4hV2Error)return{ok:false as const};throw error;}
}
export async function createHomeAction(token:string){
  try{return{ok:true as const,group:await createHome(token)};}
  catch(error){
    if(error instanceof D4hV2Error){
      const rejected=error.status===422||["SLOT_UNAVAILABLE","INVALID_ADDRESS","SERVICE_UNAVAILABLE","ADDRESS_OUTSIDE_ZONE"].includes(error.code);
      return{ok:false as const,uncertain:!rejected};
    }
    throw error;
  }
}
export async function payHomeAction(id:string){
  try{return{ok:true as const,paid:await payHome(id)};}catch(error){if(error instanceof D4hV2Error)return{ok:false as const};throw error;}
}
