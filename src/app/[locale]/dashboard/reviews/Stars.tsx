import { Star } from "lucide-react";
import s from "./reviews.module.css";

export default function Stars({
  value, label, size = 15,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  return (
    <span className={s.stars} role="img" aria-label={label} dir="ltr">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= value ? "currentColor" : "none"}
          className={n <= value ? s.starOn : s.starOff}
        />
      ))}
    </span>
  );
}