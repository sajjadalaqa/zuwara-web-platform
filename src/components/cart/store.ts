"use client";
import { useMemo, useSyncExternalStore } from "react";
import { CART_KEY, readCart, changeQuantity, removeBooked, type CartItem, type CartSelection, type CartState } from "@/lib/cart/model";
const EVENT = "zuwara-service-cart-change";
const EMPTY = '{"items":[],"completed":[]}';
function snapshot() { try { return window.localStorage.getItem(CART_KEY) || EMPTY; } catch { return EMPTY; } }
function subscribe(listener:()=>void) { const onStorage=(event:StorageEvent)=>{if(event.key===CART_KEY||event.key===null)listener();}; window.addEventListener("storage",onStorage);window.addEventListener(EVENT,listener);return()=>{window.removeEventListener("storage",onStorage);window.removeEventListener(EVENT,listener);}; }
function save(update:(state:CartState)=>CartState): boolean {
  try { const next=update(readCart(snapshot()));window.localStorage.setItem(CART_KEY,JSON.stringify(next));window.dispatchEvent(new Event(EVENT));return true; } catch { return false; }
}
export function setCartQuantity(item:CartItem,quantity:number) { return save(state=>changeQuantity(state,item,quantity)); }
export function completeCart(groupId:string,lines:CartSelection[]) { return save(state=>removeBooked(state,groupId,lines)); }
export function useServiceCart() { const raw=useSyncExternalStore(subscribe,snapshot,()=>EMPTY);return useMemo(()=>readCart(raw),[raw]); }
export function useCartReady() { return useSyncExternalStore(()=>()=>{},()=>true,()=>false); }
