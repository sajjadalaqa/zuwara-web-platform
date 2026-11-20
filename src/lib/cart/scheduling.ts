export type BookingSchedule={slots:string[];schedulingMode:"clock_picker"|"configured_slots";requiresConfiguredSlot:boolean;timezone:string;serverTime:string|null};
export function validTimezone(value:unknown):value is string{if(typeof value!=="string"||!value)return false;try{new Intl.DateTimeFormat("en",{timeZone:value}).format();return true;}catch{return false;}}
export function bookingSchedule(value:unknown):BookingSchedule{
 if(!value||typeof value!=="object")throw new Error("availability.response");
 const data=value as Record<string,unknown>;
 if(!Array.isArray(data.slots))throw new Error("availability.slots");
 const clock=data.scheduling_mode==="clock_picker"&&data.requires_configured_slot===false;
 if(data.scheduling_mode==="clock_picker"&&!clock)throw new Error("availability.scheduling_mode");
 if((clock||data.timezone!==undefined)&&!validTimezone(data.timezone))throw new Error("availability.timezone");
 const slots=[...new Set(data.slots.map(slot=>{const time=typeof slot==="string"?slot:slot?.start_time??slot?.time;if(typeof time!=="string"||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error("availability.slot_time");return time;}))];
 return {slots,schedulingMode:clock?"clock_picker":"configured_slots",requiresConfiguredSlot:!clock,timezone:validTimezone(data.timezone)?data.timezone:"Asia/Riyadh",serverTime:typeof data.server_time==="string"&&Number.isFinite(Date.parse(data.server_time))?data.server_time:null};
}
export function calendarDate(value:unknown):value is string{return typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+"T00:00:00Z"))&&new Date(value+"T00:00:00Z").toISOString().slice(0,10)===value;}
export function zonedDateTime(timezone:string,now=Date.now()){
 const parts=new Intl.DateTimeFormat("en-CA",{timeZone:timezone,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date(now));
 const part=(name:string)=>parts.find(p=>p.type===name)!.value;
 return {date:part("year")+"-"+part("month")+"-"+part("day"),time:part("hour")+":"+part("minute")};
}
export function todayInTimezone(timezone:string,offset=0,now=Date.now()){const value=zonedDateTime(timezone,now).date;const date=new Date(value+"T00:00:00Z");date.setUTCDate(date.getUTCDate()+offset);return date.toISOString().slice(0,10);}
export function scheduleNow(serverTime:string|null|undefined,receivedAt:number,localNow=Date.now()){const server=serverTime?Date.parse(serverTime):NaN;return Number.isFinite(server)?server+Math.max(0,localNow-receivedAt):localNow;}
export function futureBookingTime(date:string,time:string,timezone:string,now=Date.now()){if(!calendarDate(date)||!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)||!validTimezone(timezone))return false;const current=zonedDateTime(timezone,now);return date>current.date||(date===current.date&&time>current.time);}
export function selectableBookingTime(schedule:BookingSchedule,date:string,time:string,now=Date.now()){return schedule.schedulingMode==="clock_picker"&&!schedule.requiresConfiguredSlot?futureBookingTime(date,time,schedule.timezone,now):schedule.slots.includes(time);}
