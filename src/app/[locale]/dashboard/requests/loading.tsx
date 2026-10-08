import s from "./requests.module.css";

export default function Loading() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={`${s.skel} ${s.skelHead}`} />
      <div className={`${s.skel} ${s.skelTabs}`} />
      <div className={s.grid}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${s.skel} ${s.skelCard}`} />
        ))}
      </div>
    </div>
  );
}