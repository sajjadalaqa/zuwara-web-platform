import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-intro">
        <div>
          <Image src="/brand/zuwara-logo.png" alt="Zuwara" width={126} height={43}/>
          <p>A connected platform for trusted healthcare and everyday services—designed around clearer choices and simpler journeys.</p>
        </div>
        <div className="footer-contact">
          <span>Need help choosing the right journey?</span>
          <Link href="/help">Visit Zuwara support →</Link>
        </div>
      </div>
      <div className="container footer-grid">
        <div><h3>Healthcare</h3><Link href="/healthcare">Explore healthcare</Link><Link href="/healthcare/doctors">Find a consultant</Link><Link href="/services/therapy-sessions">Therapy</Link><Link href="/services/instant-consultations">Instant consultation</Link></div>
        <div><h3>Home services</h3><Link href="/home-services">Browse categories</Link><Link href="/home-services?view=providers">Service providers</Link><Link href="/home-services?view=shops">Shops & labs</Link><Link href="/home-services?view=request">Post a request</Link></div>
        <div><h3>Zuwara</h3><Link href="/how-it-works">How it works</Link><Link href="/about">About</Link><Link href="/insights">Insights</Link><Link href="/contact">Contact</Link></div>
        <div><h3>Account & support</h3><Link href="/login">Sign in</Link><Link href="/download">Download the app</Link><Link href="/help">Help center</Link><Link href="/ar" lang="ar">العربية</Link></div>
        <div><h3>Legal</h3><Link href="/privacy">Privacy notice</Link><Link href="/terms">Terms of use</Link><Link href="/ar" lang="ar">العربية</Link></div>
      </div>
      <div className="container footer-bottom"><p>© {new Date().getFullYear()} Zuwara. All rights reserved.</p><p>Healthcare emergencies should be directed to the appropriate emergency service.</p></div>
    </footer>
  );
}
