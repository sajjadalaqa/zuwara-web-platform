"use client";
import {Clock3} from "lucide-react";
import {futureBookingTime,zonedDateTime,type BookingSchedule} from "@/lib/cart/scheduling";
import {schedulingCopy} from "@/lib/cart/scheduling-copy";
import s from "./BookingExperience.module.css";
export default function ClockTimeField({schedule,date,time,locale,now,disabled=false,onChange}:{schedule:BookingSchedule;date:string;time:string;locale:string;now:number;disabled?:boolean;onChange:(time:string)=>void}){
 const t=schedulingCopy(locale),current=zonedDateTime(schedule.timezone,now),invalid=!!time&&!futureBookingTime(date,time,schedule.timezone,now);
 const suggestions=schedule.slots.filter(value=>futureBookingTime(date,value,schedule.timezone,now));
 return <div className={s.clockPicker}><label className={s.field}><span><Clock3 size={16}/> {t.clock}</span><input type="time" step={60} required value={time} disabled={disabled} min={date===current.date?current.time:undefined} aria-invalid={invalid} onChange={event=>onChange(event.target.value)}/></label><p className={s.note}>{t.hint}</p>{invalid&&<p className={s.alert} role="alert">{t.future}</p>}{!!suggestions.length&&<><h3>{t.suggestions}</h3><div className={s.slots}>{suggestions.map(value=><button type="button" className={value===time?s.primary:s.secondary} aria-pressed={value===time} key={value} disabled={disabled} onClick={()=>onChange(value)}>{value}</button>)}</div></>}</div>;
}
