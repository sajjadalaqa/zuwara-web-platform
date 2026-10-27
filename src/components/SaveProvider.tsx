"use client";
import { useActionState } from "react";
import { Heart, Check } from "lucide-react";
import { useLocale } from "next-intl";
import Form from "@/app/[locale]/dashboard/_patient/Form";
import { mutate, type Result } from "@/app/[locale]/dashboard/_patient/actions";

export default function SaveProvider({id,source}:{id:number|string;source:"zuwara"|"d4h"}){
 const ar=useLocale()==="ar";
 const consultant=source==="zuwara";
 const [state,action,pending]=useActionState<Result,FormData>(mutate,{ok:false});
 const label=consultant?(ar?"حفظ الاستشاري":"Save consultant"):(ar?"حفظ مقدم الخدمة":"Save provider");
 if (!consultant) return <Form op="favorite-add" source={source} id={id} label={label}/>;
 return <form action={action} className="save-provider-form">
  <input type="hidden" name="op" value="favorite-add"/>
  <input type="hidden" name="source" value={source}/>
  <input type="hidden" name="id" value={id}/>
  <button type="submit" disabled={pending||state.ok} aria-busy={pending}>
   {state.ok?<Check size={15}/>:<Heart size={15}/>}
   {pending?(ar?"جارٍ الحفظ…":"Saving…"):state.ok?(ar?"تم الحفظ":"Saved"):label}
  </button>
  {state.ok?<p role="status">{consultant?(ar?"تم حفظ الاستشاري":"Consultant saved"):(ar?"تم حفظ مقدم الخدمة":"Provider saved")}</p>:state.message?<p role="alert">{state.message}</p>:null}
 </form>;
}