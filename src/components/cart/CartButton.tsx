"use client";
import { ShoppingCart } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useServiceCart } from "./store";
import { cartCopy } from "@/lib/cart/copy";
import styles from "./Cart.module.css";
export default function CartButton(){const cart=useServiceCart(),t=cartCopy(useLocale()),count=cart.items.reduce((sum,i)=>sum+i.quantity,0);return <Link href="/cart" className={styles.headerCart} aria-label={t.cart+" ("+count+")"}><ShoppingCart size={19} aria-hidden="true"/>{count>0&&<span className={styles.badge} aria-hidden="true">{count>99?"99+":count}</span>}</Link>;}
