import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = { title: "How It Works", description: "Understand the separate healthcare and home-service journeys within Zuwara.", alternates: { canonical: "/how-it-works" } };

export default function HowItWorksPage(){return <><PageHero eyebrow="How Zuwara works" title="One platform. Two focused journeys." description="Discovery feels connected, while healthcare and D4H retain their own booking, payment, wallet, and operational rules." action={false}/><section className="content-section"><div className="container how-grid"><article><Icon name="heart"/><span>Healthcare</span><h2>Find care and confirm an appointment.</h2><ol><li>Choose a specialty or consultant</li><li>Review duration and availability</li><li>Confirm the patient and payment</li><li>Continue to consultation and follow-up</li></ol><Link href="/healthcare" className="text-link">Explore healthcare <Icon name="arrow" size={17}/></Link></article><article><Icon name="home"/><span>Home services</span><h2>Choose a service and track its progress.</h2><ol><li>Browse a category or search</li><li>Refine by location and provider</li><li>Confirm the booking details</li><li>Track, complete, and review</li></ol><Link href="/home-services" className="text-link">Explore home services <Icon name="arrow" size={17}/></Link></article></div></section></>}
