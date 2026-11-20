import {getLocale} from "next-intl/server";
import {notFound,redirect} from "next/navigation";
import {readHeaderSession} from "@/lib/auth/session";
export default async function TherapyAvailability({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[1-9]\d{0,9}$/.test(id))notFound();
 const [locale,session]=await Promise.all([getLocale(),readHeaderSession()]);const prefix=locale==="ar"?"/ar":"";
 if(!session.signedIn||session.sessionExpiresAt<=Date.now()+15000)redirect(prefix+"/login-page?"+new URLSearchParams({consultantReturn:"/therapy/"+id+"/availability",bookingFlow:"therapy"}));
 redirect(prefix+"/dashboard/therapy/"+id+"#therapy-booking");
}
