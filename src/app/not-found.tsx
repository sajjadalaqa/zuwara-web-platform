import Link from "next/link";
export default function NotFound(){return <section className="page-hero"><div className="container narrow"><span className="eyebrow eyebrow-light">404</span><h1>This page is not here.</h1><p>The link may have changed, or the page may not be part of this presentation build.</p><Link href="/" className="button button-light">Return home</Link></div></section>}
