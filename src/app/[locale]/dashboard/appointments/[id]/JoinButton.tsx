import s from "./detail.module.css";
import { Video } from "lucide-react";
type Props = { startsAt: string; durationMin: number | null; url?: string; labels: { join: string; soon: string; ended: string; none: string } };
export default function JoinButton({ url, labels }: Props) {
  return url ? <a className={s.joinBtn} href={url}><Video size={17} />{labels.join}</a> : <p className={s.joinNote}>{labels.none}</p>;
}
