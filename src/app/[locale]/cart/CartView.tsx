"use client";
import { useEffect, useRef, useState } from "react";
import { ShoppingCart, Trash2, Plus, Minus, CheckCircle2, LayoutGrid, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useServiceCart, useCartReady, setCartQuantity, completeCart } from "@/components/cart/store";
import { cartCopy, cartError } from "@/lib/cart/copy";
import { cartSelection, selectionKey, todayInRiyadh, readCart, CART_KEY, QUANTITY_LIMIT, type CartItem, type CartSelection } from "@/lib/cart/model";
import type { CartOptions, CartQuote, CartGroup } from "@/lib/api/d4h/cart";
import { prepareCartAction, cartSlotsAction, previewCartAction, createCartAction, payCartAction, resumeCartAction } from "./actions";
import styles from "@/components/cart/Cart.module.css";

type Recovery={identity:string;token:string;lines:CartSelection[];receipt?:string};
const recoveryKey=(identity:string)=>"zuwara.service-checkout.v1."+identity;
function readRecovery(identity:string|null):Recovery|null {
  try{if(!identity)return null;const raw=localStorage.getItem(recoveryKey(identity));if(!raw||raw.length>40000)return null;const value=JSON.parse(raw);if(value.identity!==identity||typeof value.token!=="string"||!value.token||value.token.length>25000)return null;return {identity,token:value.token,lines:cartSelection(value.lines),...(typeof value.receipt==="string"&&value.receipt.length<2000?{receipt:value.receipt}:{})};}catch{return null;}
}
function saveRecovery(value:Recovery){try{const existing=readRecovery(value.identity);if(existing&&existing.token!==value.token)return false;localStorage.setItem(recoveryKey(value.identity),JSON.stringify(value));return true;}catch{return false;}}
function clearRecovery(identity:string){try{localStorage.removeItem(recoveryKey(identity));}catch{}}

export default function CartView({locale,identity}:{locale:string;identity:string|null}) {
  const cart=useServiceCart(),ready=useCartReady(),t=cartCopy(locale),ar=locale==="ar";
  const [busy,setBusy]=useState(false),operation=useRef(false);
  const [error,setError]=useState("");
  const [options,setOptions]=useState<CartOptions|null>(null),[optionsKey,setOptionsKey]=useState("");
  const [providerId,setProviderId]=useState(0),[addressId,setAddressId]=useState(0),[date,setDate]=useState(""),[time,setTime]=useState(""),[notes,setNotes]=useState("");
  const [slots,setSlots]=useState<string[]>([]),[searched,setSearched]=useState(false);
  const [quote,setQuote]=useState<CartQuote|null>(null),[recovery,setRecovery]=useState<Recovery|null>(null),[group,setGroup]=useState<CartGroup|null>(null);
  useEffect(()=>{const frame=requestAnimationFrame(()=>setRecovery(readRecovery(identity)));return()=>cancelAnimationFrame(frame);},[identity]);
  const lines=cart.items.map(i=>({serviceId:i.serviceId,quantity:i.quantity})),key=selectionKey(lines);
  const stale=!!options&&key!==optionsKey,locked=busy||!!recovery||!!group;
  const amount=(n:number)=>new Intl.NumberFormat(locale,{style:"currency",currency:"SAR"}).format(n/100);
  const estimate=cart.items.every(i=>i.unitHalalas!==null)?cart.items.reduce((sum,i)=>sum+i.unitHalalas!*i.quantity,0):null;
  async function work(run:()=>Promise<void>){if(operation.current)return;operation.current=true;setBusy(true);setError("");try{if(identity&&navigator.locks){await navigator.locks.request("zuwara.service-checkout."+identity,run);}else await run();}catch{setError(t.CHECKOUT_UNAVAILABLE);}finally{operation.current=false;setBusy(false);}}
  function edit(item:CartItem,quantity:number){if(locked)return;if(!setCartQuantity(item,quantity)){setError(t.storage);return;}setOptions(null);setQuote(null);setSlots([]);setTime("");setSearched(false);setError("");}
  function resetTimes(){setSlots([]);setTime("");setSearched(false);setQuote(null);}
  function settled(value:CartGroup,saved:Recovery){setGroup(value);if(value.paid){if(completeCart(value.id,saved.lines)){clearRecovery(saved.identity);setRecovery(null);}else setError(t.storage);}}
  async function prepare(){await work(async()=>{if(!identity)return;const saved=readRecovery(identity);if(saved){setRecovery(saved);return;}const result=await prepareCartAction(lines);if(!result.ok){setError(cartError(result.code,locale));return;}setOptions(result.value);setOptionsKey(key);setProviderId(result.value.providers[0]?.id??0);setAddressId(result.value.addresses[0]?.id??0);setDate(todayInRiyadh());resetTimes();});}
  async function findTimes(){await work(async()=>{if(stale){setError(t.changed);return;}const result=await cartSlotsAction(lines,providerId,date);if(!result.ok){setError(cartError(result.code,locale));return;}setSlots(result.value);setTime("");setSearched(true);});}
  async function preview(){await work(async()=>{if(stale){setError(t.changed);return;}const result=await previewCartAction({lines,providerId,addressId,date,time,notes});if(!result.ok){setError(cartError(result.code,locale));return;}setQuote(result.value);});}
  async function confirm(){await work(async()=>{
    if(!identity||!quote||stale||selectionKey(readCart(localStorage.getItem(CART_KEY)).items)!==key){setError(t.changed);return;}if(quote.expiresAt<Date.now()){setQuote(null);setError(t.EXPIRED_QUOTE);return;}
    const existing=readRecovery(identity);if(existing){setRecovery(existing);return;}
    const saved:Recovery={identity,token:quote.token,lines:cartSelection(lines)};
    if(!saveRecovery(saved)){setError(t.storage);return;}setRecovery(saved);
    const result=await createCartAction(saved.token);
    if(!result.ok){setError(cartError(result.code,locale));if(!result.uncertain){clearRecovery(identity);setRecovery(null);setQuote(null);}return;}
    const next={...saved,receipt:result.value.receipt};saveRecovery(next);setRecovery(next);settled(result.value,next);
  });}
  async function resume(){await work(async()=>{if(!recovery)return;const result=recovery.receipt?await resumeCartAction(recovery.receipt):await createCartAction(recovery.token);if(!result.ok){setError(cartError(result.code,locale));return;}const next={...recovery,receipt:result.value.receipt};saveRecovery(next);setRecovery(next);settled(result.value,next);});}
  async function pay(){await work(async()=>{if(!group||group.paid||!recovery)return;const result=await payCartAction(group.receipt);if(!result.ok){setError(cartError(result.code,locale));return;}if(!result.value){setError(t.paymentPending);return;}settled({...group,paid:true},recovery);});}
  const login="/login-page?consultantReturn=%2Fcart&bookingFlow=cart";
  if(!ready)return <div className={styles.page}><div className="container"><p role="status">{t.loading}</p></div></div>;
  return <div className={styles.page}><div className="container">
    <header className={styles.hero}><h1><ShoppingCart size={27} aria-hidden="true"/>{t.cart}</h1><p>{t.cartHint}</p></header>
    {error&&<div className={styles.alert} role="alert">{error}</div>}
    {recovery&&!group&&<section className={styles.panel}><h2>{t.resume}</h2><p className={styles.note}>{t.resumeNote}</p><button type="button" className={styles.primary} disabled={busy} onClick={()=>void resume()}>{busy?t.loading:t.resume}</button><div className={styles.links}><Link href="/dashboard/home-visits" className={styles.secondary}>{t.history}</Link></div></section>}
    {group&&<section className={styles.panel}><h2>{group.paid?<><CheckCircle2 size={20} aria-hidden="true"/> {t.paid}</>:t.reserved}</h2><p className={styles.receipt}>{t.reference}: <bdi dir="ltr">{group.id}</bdi></p><p className={styles.amount}>{amount(group.amountHalalas)}</p>{!group.paid&&<><p className={styles.note}>{t.paymentPending}</p><button type="button" className={styles.primary} disabled={busy} onClick={()=>void pay()}>{busy?t.loading:t.pay}</button></>}<div className={styles.links}>{!group.paid&&<Link href="/dashboard/wallet" target="_blank" rel="noopener noreferrer" className={styles.secondary}>{t.wallet}</Link>}<Link href="/dashboard/home-visits" className={styles.secondary}>{t.history}</Link><Link href="/home-services" className={styles.browseButton}><span className={styles.browseIcon}><LayoutGrid size={16} aria-hidden="true"/></span><span>{t.browse}</span><ArrowRight size={16} className={styles.browseArrow} aria-hidden="true"/></Link></div></section>}
    {!cart.items.length&&!group&&!recovery&&<div className={styles.empty}><ShoppingCart size={38}/><h2>{t.empty}</h2><p>{t.emptyText}</p><Link href="/home-services" className={styles.primary}>{t.browse}</Link></div>}
    {!!cart.items.length&&!group&&<div className={styles.layout}>
      <div className={styles.items}>{cart.items.map(item=><article className={styles.item} key={item.serviceId}><div><h2>{ar?item.nameAr||item.name:item.name}</h2><p>{item.unitHalalas===null?t.unknownPrice:amount(item.unitHalalas)}</p></div><div className={styles.itemActions}><div className={styles.quantity} aria-label={t.quantity}><button type="button" disabled={locked} onClick={()=>edit(item,item.quantity-1)} aria-label={t.quantity+" -1"}><Minus size={14}/></button><output>{item.quantity}</output><button type="button" disabled={locked||item.quantity>=QUANTITY_LIMIT} onClick={()=>edit(item,item.quantity+1)} aria-label={t.quantity+" +1"}><Plus size={14}/></button></div><button type="button" disabled={locked} onClick={()=>edit(item,0)} className={styles.remove} aria-label={t.remove+": "+item.name}><Trash2 size={16}/></button></div></article>)}</div>
      <aside className={styles.panel}><h2>{t.cart}</h2><div className={styles.summary}><span>{t.estimate}</span><strong>{estimate===null?"—":amount(estimate)}</strong></div><p className={styles.note}>{t.estimateNote}</p><p className={styles.note}>{t.oneVisit}</p>{!identity?<><p className={styles.note}>{t.signInNote}</p><Link href={login} className={styles.primary}>{t.signIn}</Link></>:<button type="button" disabled={locked} className={styles.primary} onClick={()=>void prepare()}>{busy?t.loading:options?t.refresh:t.checkout}</button>}<div className={styles.links}><Link href="/home-services" className={styles.browseButton}><span className={styles.browseIcon}><LayoutGrid size={16} aria-hidden="true"/></span><span>{t.browse}</span><ArrowRight size={16} className={styles.browseArrow} aria-hidden="true"/></Link></div></aside>
    </div>}
    {stale&&!group&&!recovery&&<p className={styles.alert}>{t.changed}</p>}
    {options&&!stale&&!group&&!recovery&&<section className={styles.checkout}>
      <div className={styles.panel}><h2>{t.checkout}</h2><p className={styles.note}>{t.duration}: {options.minutes} {t.minutes}</p>
        {!options.providers.length&&<p className={styles.alert}>{t.noProviders}</p>}
        {!options.addresses.length&&<div className={styles.alert}>{t.noAddresses}<div className={styles.links}><Link href="/dashboard/addresses" target="_blank" rel="noopener noreferrer" className={styles.secondary}>{t.addAddress}</Link></div></div>}
        {!!options.providers.length&&!!options.addresses.length&&<form className={styles.form} onSubmit={event=>{event.preventDefault();void preview();}}>
          <label className={styles.field}>{t.provider}<select value={providerId} disabled={busy||!!quote} onChange={e=>{setProviderId(Number(e.target.value));resetTimes();}} required><option value="">{t.chooseProvider}</option>{options.providers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className={styles.field}>{t.address}<select value={addressId} disabled={busy||!!quote} onChange={e=>{setAddressId(Number(e.target.value));setQuote(null);}} required><option value="">{t.chooseAddress}</option>{options.addresses.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label>
          <label className={styles.field}>{t.date}<input type="date" value={date} min={todayInRiyadh()} max={todayInRiyadh(60)} disabled={busy||!!quote} required onChange={e=>{setDate(e.target.value);resetTimes();}}/></label>
          <div className={styles.field}><span>{t.time}</span><button type="button" className={styles.secondary} disabled={busy||!!quote||!date||!providerId} onClick={()=>void findTimes()}>{busy?t.loading:t.findTimes}</button></div>
          {searched&&<label className={styles.field+" "+styles.full}>{t.time}<select value={time} disabled={busy||!!quote||!slots.length} onChange={e=>setTime(e.target.value)} required><option value="">{slots.length?t.chooseTime:t.noTimes}</option>{slots.map(s=><option key={s} value={s}>{s}</option>)}</select></label>}
          <label className={styles.field+" "+styles.full}>{t.notes}<textarea maxLength={2000} value={notes} disabled={busy||!!quote} onChange={e=>setNotes(e.target.value)}/></label>
          {!quote&&<button className={styles.primary} type="submit" disabled={busy||!time}>{busy?t.loading:t.review}</button>}
        </form>}
      </div>
      {quote&&<div className={styles.quote}><h3>{t.confirmed}</h3><p className={styles.amount}>{amount(quote.amountHalalas)}</p><p className={styles.note}>{t.confirmedNote}</p><div className={styles.links}><button type="button" className={styles.primary} disabled={busy} onClick={()=>void confirm()}>{busy?t.loading:t.confirm}</button><button type="button" className={styles.secondary} disabled={busy} onClick={()=>setQuote(null)}>{t.change}</button></div></div>}
    </section>}
  </div></div>;
}
