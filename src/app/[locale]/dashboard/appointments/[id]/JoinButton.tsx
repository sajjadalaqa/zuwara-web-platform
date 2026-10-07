"use client";

import { useEffect, useState } from "react";
import { Video } from "lucide-react";
import s from "./detail.module.css";

type Props = {
  startsAt: string;
  durationMin: number;
  url?: string;
  labels: { join: string; soon: string; ended: string; none: string };
};

const EARLY_MS = 10 * 60 * 1000;

export default function JoinButton({ startsAt, durationMin, url, labels }: Props) {
  // null on the server and first paint, so there is no hydration mismatch
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!url) return <p className={s.joinNote}>{labels.none}</p>;

  const start = new Date(startsAt).getTime();
  const end = start + durationMin * 60000;

  if (now !== null && now > end) return <p className={s.joinNote}>{labels.ended}</p>;

  const live = now !== null && now >= start - EARLY_MS;

  return live ? (
    <a className={s.joinBtn} href={url} target="_blank" rel="noopener noreferrer">
      <Video size={17} />
      {labels.join}
    </a>
  ) : (
    <>
      <span className={`${s.joinBtn} ${s.joinOff}`} aria-disabled="true">
        <Video size={17} />
        {labels.join}
      </span>
      <p className={s.joinNote}>{labels.soon}</p>
    </>
  );
}