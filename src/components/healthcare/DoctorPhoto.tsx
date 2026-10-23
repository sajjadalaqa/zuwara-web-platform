"use client";
import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/Icon";
export function DoctorPhoto({ src, name, sizes, priority = false }: { src: string | null; name: string; sizes: string; priority?: boolean }) {
 const [failed, setFailed] = useState<string | null>(null);
 return <><span className="profile-fallback" aria-hidden="true"><Icon name="user" size={38}/></span>{src && failed !== src ? <Image src={src} alt={name} fill sizes={sizes} priority={priority} onError={() => setFailed(src)} /> : null}</>;
}
