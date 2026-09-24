import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "Help & Support", description: "Find guidance for Zuwara healthcare and D4H home-service journeys.", alternates: { canonical: "/help" } };

export default function HelpPage(){return <><PageHero eyebrow="Zuwara support" title="Help for every journey." description="Start with the area that matches your booking. Healthcare and home services remain separate operational systems." action={false}/><section className="content-section"><div className="container support-grid"><article><Icon name="heart"/><h2>Healthcare support</h2><p>Questions about consultants, appointments, therapy, payment confirmation, reports, or prescriptions.</p><Link href="/contact" className="button button-primary">Contact healthcare support</Link></article><article><Icon name="home"/><h2>Home-service support</h2><p>Questions about categories, providers, locations, service bookings, requests, tracking, or reviews.</p><Link href="/contact" className="button button-secondary">Contact home-service support</Link></article></div></section></>}
