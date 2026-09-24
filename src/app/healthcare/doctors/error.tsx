"use client";

export default function DoctorsError({ reset }: { reset: () => void }) {
  return <div className="container page-error" role="alert"><h1>We couldn’t load consultants.</h1><p>The healthcare service may be temporarily unavailable. No booking information was changed.</p><button type="button" className="button button-primary" onClick={reset}>Try again</button></div>;
}
