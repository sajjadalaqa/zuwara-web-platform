"use client";
import { useState,useTransition } from "react";
import { useRouter } from "next/navigation";
import { markReadAction } from "./actions";
import s from "./notifications.module.css";
export default function ReadToggle({id,read}:{id:string;read:boolean}){const router=useRouter(),[pending,start]=useTransition(),[error,setError]=useState("");return <div><button className={s.markAll} disabled={pending} onClick={()=>start(async()=>{try{const result=await markReadAction(id,!read);if(result.ok){setError("");router.refresh();}else setError("Read status could not be updated.");}catch{setError("Read status could not be updated.");}})}>{read?"Mark unread":"Mark read"}</button>{error?<p role="alert">{error}</p>:null}</div>;}
