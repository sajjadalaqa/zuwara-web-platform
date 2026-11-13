"use client";
import { useState } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import { useServiceCart, setCartQuantity } from "./store";
import { cartCopy } from "@/lib/cart/copy";
import { moneyHalalas, QUANTITY_LIMIT, CART_LIMIT, type CartItem } from "@/lib/cart/model";
import type { CatalogService } from "@/lib/api/d4h/catalog";
import styles from "./Cart.module.css";
export default function AddToCart({service}:{service:CatalogService}){
  const locale=useLocale(),t=cartCopy(locale),cart=useServiceCart();const [error,setError]=useState("");
  const existing=cart.items.find(i=>i.serviceId===service.id),quantity=existing?.quantity??0;
  const item:CartItem={serviceId:service.id,quantity:1,name:service.name,nameAr:service.name_ar,unitHalalas:service.price?.currency==="SAR"?moneyHalalas(service.price.final):null};
  function update(n:number){setError("");if(!quantity&&cart.items.length>=CART_LIMIT){setError(t.CART_FULL);return;}if(!setCartQuantity(item,n))setError(t.storage);}
  return <div className={styles.addControl}>{quantity ? <div className={styles.quantity} aria-label={t.quantity}><button type="button" onClick={()=>update(quantity-1)} aria-label={quantity===1?t.remove:t.quantity+" -1"}><Minus size={14}/></button><output aria-live="polite">{quantity}</output><button type="button" disabled={quantity>=QUANTITY_LIMIT} onClick={()=>update(quantity+1)} aria-label={t.quantity+" +1"}><Plus size={14}/></button></div>:<button type="button" className={styles.addButton} onClick={()=>update(1)}><ShoppingCart size={15}/>{t.add}</button>}{error&&<small className={styles.error} role="status">{error}</small>}</div>;
}
