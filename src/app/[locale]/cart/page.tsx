import type { Metadata } from "next";
import { readSession } from "@/lib/auth/session";
import { cartCopy } from "@/lib/cart/copy";
import CartView from "./CartView";
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{const {locale}=await params;return {title:cartCopy(locale).cart,robots:{index:false,follow:false}};}
async function cartIdentity(){const session=await readSession();return session&&Date.parse(session.session.access_expires_at)>Date.now()+15000?session.user.id:null;}
export default async function CartPage({params}:Props){const {locale}=await params,identity=await cartIdentity();return <CartView key={identity??"guest"} locale={locale} identity={identity}/>;}
