"use client";
import {useEffect,useRef,useState} from "react";
import {CalendarDays,Clock3,LoaderCircle,X} from "lucide-react";
import premium from "./BookingExperience.module.css";
import {experienceCopy} from "@/lib/cart/experience-copy";
import {schedulingCopy} from "@/lib/cart/scheduling-copy";
import {todayInTimezone,scheduleNow,selectableBookingTime} from "@/lib/cart/scheduling";
import ClockTimeField from "./ClockTimeField";
import {cartSlotsAction} from "@/app/[locale]/cart/actions";
import {availabilityDiagnostic,availabilityError,type AvailabilityDiagnostic} from "@/lib/cart/availability-errors";
import {cartError} from "@/lib/cart/copy";
import {bookingCopy} from "@/lib/cart/booking-copy";
import {selectionKey,type CartSelection} from "@/lib/cart/model";
import type {CartAvailability} from "@/lib/api/d4h/cart";
import baseStyles from "./Cart.module.css";
const s={...baseStyles,...premium};
export default function BookingTimePicker({lines,providerId,addressId,locale,initialDate,onSelect,onClose}:{lines:CartSelection[];providerId:number;addressId:number;locale:string;initialDate:string;onSelect:(date:string,time:string,value:CartAvailability)=>void;onClose:()=>void}){
 const t=bookingCopy(locale),u=experienceCopy(locale),c=schedulingCopy(locale),dialog=useRef<HTMLDialogElement>(null);
 const [date,setDate]=useState(initialDate||todayInTimezone("UTC",1)),[time,setTime]=useState(""),[retry,setRetry]=useState(0);
 const [tick,setTick]=useState(()=>Date.now());
 const [clock,setClock]=useState(()=>({timezone:"UTC",serverTime:null as string|null,receivedAt:Date.now(),loaded:false}));
 const [response,setResponse]=useState<{key:string;value?:CartAvailability;error?:string;diagnostic?:AvailabilityDiagnostic}|null>(null);
 const key=selectionKey(lines)+"/"+providerId+"/"+addressId+"/"+date+"/"+retry;
 useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
 useEffect(()=>{const timer=setInterval(()=>setTick(Date.now()),30000);return()=>clearInterval(timer);},[]);
 useEffect(()=>{let active=true;cartSlotsAction(lines,providerId,date,addressId).then(result=>{if(!active)return;if(result.ok){setClock({timezone:result.value.timezone,serverTime:result.value.serverTime,receivedAt:Date.now(),loaded:true});setResponse({key,value:result.value});}else setResponse({key,error:result.diagnostic?availabilityError(result.diagnostic,locale,cartError(result.code,locale)):cartError(result.code,locale),diagnostic:result.diagnostic});}).catch(()=>{if(active)setResponse({key,error:availabilityError(availabilityDiagnostic("request","ACTION_REQUEST_FAILED"),locale,cartError("CHECKOUT_UNAVAILABLE",locale)),diagnostic:availabilityDiagnostic("request","ACTION_REQUEST_FAILED")});});return()=>{active=false;};},[lines,providerId,addressId,date,key,locale]);
 const current=response?.key===key?response:null,value=current?.value;
 const now=scheduleNow(clock.serverTime,clock.receivedAt,tick),minimum=todayInTimezone(clock.timezone,0,now),maximum=todayInTimezone(clock.timezone,60,now);
 const canSelect=!!value&&date>=minimum&&date<=maximum&&selectableBookingTime(value,date,time,now);
 return <dialog ref={dialog} className={s.timeDialog} aria-labelledby="booking-slot-title" onCancel={event=>{event.preventDefault();onClose();}}>
 <div className={s.dialogHeading}><div><span className={s.eyebrow}>{u.details}</span><h2 id="booking-slot-title">{t.chooseDateTime}</h2></div><button type="button" className={s.secondary} onClick={onClose} aria-label={t.close}><X size={16}/><span>{t.close}</span></button></div>
 <p className={s.note}>{clock.loaded?c.timezone+": "+clock.timezone:c.timezonePending}</p>
 <label className={s.field}>{t.date}<input autoFocus type="date" value={date} min={minimum} max={maximum} required onChange={event=>{if(event.target.value){setDate(event.target.value);setTime("");}}}/></label>
 <div className={s.dateStrip} role="group" aria-label={u.chooseDate}>{Array.from({length:7},(_,index)=>{const day=todayInTimezone(clock.timezone,index,now),dayDate=new Date(day+"T12:00:00Z");return <button type="button" key={day} aria-pressed={day===date} onClick={()=>{setDate(day);setTime("");}}><small>{new Intl.DateTimeFormat(locale,{weekday:"short",timeZone:"UTC"}).format(dayDate)}</small><strong>{new Intl.DateTimeFormat(locale,{day:"numeric",timeZone:"UTC"}).format(dayDate)}</strong></button>;})}</div>
 <h3>{t.chooseTime}</h3>
 {!current?<div role="status" className={s.loadingState}><LoaderCircle size={25}/>{t.loading}</div>:current.error?<div role="alert" className={s.alert}>{current.error}{current.diagnostic&&<details><summary>{locale==="ar"?"\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062f\u0639\u0645":"Support details"}</summary><code dir="ltr">{[current.diagnostic.stage,current.diagnostic.code,current.diagnostic.status?"HTTP "+current.diagnostic.status:null,current.diagnostic.reason,current.diagnostic.coverage?"provider: "+current.diagnostic.coverage.providerId+", address: "+current.diagnostic.coverage.addressId+", "+current.diagnostic.coverage.locationState:null,current.diagnostic.validationFields?.length?"fields: "+current.diagnostic.validationFields.join(", "):null,current.diagnostic.requestId].filter(Boolean).join(" / ")}</code></details>}<button type="button" className={s.secondary} onClick={()=>setRetry(n=>n+1)}>{t.retry}</button></div>:value?.schedulingMode==="clock_picker"?<ClockTimeField schedule={value} date={date} time={time} locale={locale} now={now} onChange={setTime}/>:value&&!value.slots.length?<div role="status" className={s.emptyState}><CalendarDays size={28}/><p>{t.empty}</p></div>:<div className={s.slots} role="group" aria-label={t.chooseTime}>{value?.slots.map(slot=><button type="button" key={slot} aria-pressed={slot===time} className={slot===time?s.primary:s.secondary} onClick={()=>setTime(slot)}>{slot}</button>)}</div>}
 <button type="button" className={s.primary} disabled={!canSelect} onClick={()=>{if(value&&date>=minimum&&date<=maximum&&selectableBookingTime(value,date,time,scheduleNow(clock.serverTime,clock.receivedAt)))onSelect(date,time,value);}}><Clock3 size={16}/>{t.select}</button></dialog>;
}
