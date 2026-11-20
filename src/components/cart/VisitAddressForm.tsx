"use client";
/* eslint-disable @next/next/no-img-element -- Map tiles render at their native 256px size. */
import {useEffect,useRef,useState} from "react";
import {MapPin,Navigation,CheckCircle2,LoaderCircle,Plus,Minus,ArrowUp,ArrowDown,ArrowLeft,ArrowRight} from "lucide-react";
import {saveCartAddressAction} from "@/app/[locale]/cart/actions";
import {experienceCopy} from "@/lib/cart/experience-copy";
import {locateVisit,VisitLocationError} from "@/lib/cart/geolocation";
import premium from "./BookingExperience.module.css";
import {bookingCopy} from "@/lib/cart/booking-copy";
import {cartError} from "@/lib/cart/copy";
import type {CartOptions} from "@/lib/api/d4h/cart";
import baseStyles from "./Cart.module.css";
const s={...baseStyles,...premium};
type Point={lat:number;long:number};
const project=(p:Point,z:number)=>{const scale=256*2**z,lat=Math.max(-85,Math.min(85,p.lat))*Math.PI/180;return {x:(p.long+180)/360*scale,y:(1-Math.log(Math.tan(lat)+1/Math.cos(lat))/Math.PI)/2*scale};};
const unproject=(x:number,y:number,z:number):Point=>{const scale=256*2**z;return {lat:Math.atan(Math.sinh(Math.PI*(1-2*y/scale)))*180/Math.PI,long:((x/scale*360)%360+360)%360-180};};
export default function VisitAddressForm({locale,disabled,onSaved,onBusyChange}:{locale:string;disabled:boolean;onSaved:(addresses:CartOptions["addresses"])=>void;onBusyChange:(busy:boolean)=>void}){
 const t=bookingCopy(locale),u=experienceCopy(locale),[lat,setLat]=useState(""),[long,setLong]=useState(""),[map,setMap]=useState(false),[center,setCenter]=useState<Point>({lat:24.7136,long:46.6753}),[zoom,setZoom]=useState(13),[busy,setBusy]=useState(false),[locating,setLocating]=useState(false),[error,setError]=useState("");
 const [address,setAddress]=useState(""),[accuracy,setAccuracy]=useState<number|null>(null);
 const locationRequest=useRef(0);
 useEffect(()=>()=>{locationRequest.current++;},[]);
 const valid=lat!==""&&long!==""&&Number.isFinite(Number(lat))&&Number.isFinite(Number(long))&&Math.abs(Number(lat))<=90&&Math.abs(Number(long))<=180;
 const pixel=project(center,zoom),tileX=Math.floor(pixel.x/256),tileY=Math.floor(pixel.y/256);
 const pin=valid?project({lat:Number(lat),long:Number(long)},zoom):null;
 function choose(p:Point,label=u.pinnedLocation){setLat(p.lat.toFixed(6));setLong(p.long.toFixed(6));setAddress(current=>current.trim()?current:label);setAccuracy(null);setError("");}
 function move(dx:number,dy:number){setCenter(unproject(pixel.x+dx,pixel.y+dy,zoom));}
 async function locate(){const request=++locationRequest.current;setLocating(true);setError("");onBusyChange(true);try{const point=await locateVisit(navigator.geolocation,typeof window==="undefined"||window.isSecureContext!==false);if(request!==locationRequest.current)return;choose(point,u.currentLocation);setAccuracy(point.accuracy);setCenter(point);setMap(true);}catch(error){if(request!==locationRequest.current)return;const code=error instanceof VisitLocationError?error.code:"unavailable";setError(code==="denied"?u.permissionDenied:code==="timeout"?u.locationTimeout:code==="insecure"?u.locationInsecure:u.locationUnavailable);}finally{if(request===locationRequest.current){setLocating(false);onBusyChange(false);}}}
 return <form className={s.addressForm} onSubmit={async event=>{event.preventDefault();if(busy||disabled||!valid)return;const fd=new FormData(event.currentTarget);setBusy(true);onBusyChange(true);setError("");try{const result=await saveCartAddressAction(fd);if(!result.ok){setError(cartError(result.code,locale));return;}onSaved(result.value);}catch{setError(cartError("CHECKOUT_UNAVAILABLE",locale));}finally{setBusy(false);onBusyChange(false);}}}><fieldset disabled={disabled||busy||locating}>
 <label className={s.field}>{u.locationDetails}<textarea name="address" required maxLength={1000} value={address} onChange={event=>setAddress(event.target.value)} placeholder={u.addressPlaceholder}/></label>
 <div className={s.addressActions}><button type="button" className={s.secondary} onClick={()=>setMap(v=>!v)}><MapPin size={18}/>{t.map}</button><button type="button" className={s.secondary} disabled={locating} onClick={locate}>{locating?<LoaderCircle size={18} className={s.spinning}/>:<Navigation size={18}/>}<span>{locating?u.findingLocation:t.location}</span></button></div>
 {error&&<p role="alert" className={s.alert}>{error}</p>}{valid&&<div className={s.locationStatus} role="status"><CheckCircle2 size={19}/><div><strong>{u.locationFound}</strong><p>{u.locationReady}</p><code dir="ltr">{lat}, {long}{accuracy!==null?" | "+u.accuracy+": "+Math.round(accuracy)+" m":""}</code></div></div>}{locating&&<p role="status" className={s.note}>{u.findingLocation}</p>}<p className={s.note}>{u.locationHint}</p>
 {map&&<div className={s.mapPicker}><div className={s.mapToolbar}><p>{u.pinHint}</p><div className={s.mapControls}><button type="button" aria-label="Zoom in" onClick={()=>setZoom(z=>Math.min(18,z+1))}><Plus/></button><button type="button" aria-label="Zoom out" onClick={()=>setZoom(z=>Math.max(3,z-1))}><Minus/></button><button type="button" aria-label="Move north" onClick={()=>move(0,-160)}><ArrowUp/></button><button type="button" aria-label="Move south" onClick={()=>move(0,160)}><ArrowDown/></button><button type="button" aria-label="Move west" onClick={()=>move(-160,0)}><ArrowLeft/></button><button type="button" aria-label="Move east" onClick={()=>move(160,0)}><ArrowRight/></button></div></div>
 <button type="button" className={s.mapCanvas} aria-label={t.pin} onClick={event=>{const rect=event.currentTarget.getBoundingClientRect();choose(unproject(pixel.x+event.clientX-rect.left-rect.width/2,pixel.y+event.clientY-rect.top-rect.height/2,zoom));}} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();choose(center);}}}>
 {Array.from({length:15},(_,i)=>{const x=tileX+i%5-2,y=tileY+Math.floor(i/5)-1;if(y<0||y>=2**zoom)return null;return <img key={zoom+"/"+x+"/"+y} src={"https://tile.openstreetmap.org/"+zoom+"/"+((x%2**zoom+2**zoom)%2**zoom)+"/"+y+".png"} alt="" draggable={false} width={256} height={256} style={{left:"calc(50% + "+(x*256-pixel.x)+"px)",top:"calc(50% + "+(y*256-pixel.y)+"px)"}}/>;})}
 {pin&&<span className={s.mapPin} style={{left:"calc(50% + "+(pin.x-pixel.x)+"px)",top:"calc(50% + "+(pin.y-pixel.y)+"px)"}}><MapPin size={32} fill="white"/></span>}</button><div className={s.mapFooter}><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">&copy; OpenStreetMap contributors</a><button type="button" className={s.secondary} onClick={()=>{if(!valid)choose(center);setMap(false);}}>{t.confirmLocation}</button></div></div>}
 <details className={s.coordinateDetails}><summary>{t.coordinates}</summary><div className={s.form}><label className={s.field}>{locale==="ar"?"\u062e\u0637 \u0627\u0644\u0639\u0631\u0636":"Latitude"}<input name="lat" type="number" step="any" min="-90" max="90" required value={lat} onChange={event=>setLat(event.target.value)}/></label><label className={s.field}>{locale==="ar"?"\u062e\u0637 \u0627\u0644\u0637\u0648\u0644":"Longitude"}<input name="long" type="number" step="any" min="-180" max="180" required value={long} onChange={event=>setLong(event.target.value)}/></label></div></details>
 <button type="submit" className={s.primary} disabled={!valid||busy||locating}>{busy?"...":t.save}</button></fieldset></form>;
}
