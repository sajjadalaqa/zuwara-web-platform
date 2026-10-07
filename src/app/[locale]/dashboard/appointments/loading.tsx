import s from "./appointments.module.css";

export default function Loading() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={`${s.skel} ${s.skelTitle}`} />
      <div className={`${s.skel} ${s.skelBar}`} />
      <div className={s.list}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${s.skel} ${s.skelCard}`} />
        ))}
      </div>
    </div>
  );
}