"use client";
import Image from "next/image";
import {useState} from "react";
import {Icon} from "@/components/Icon";
export function SpecialtyImage({src}:{src?:string|null}){
const [failed,setFailed]=useState(false);
return <span style={{position:"relative",display:"grid",placeItems:"center",width:"100%",height:"100%",background:"#f3e9fa",color:"#8450a7"}}><Icon name="heart" size={26}/>{src&&!failed?<Image src={src} alt="" fill sizes="64px" style={{objectFit:"cover"}} onError={()=>setFailed(true)}/>:null}</span>;
}
