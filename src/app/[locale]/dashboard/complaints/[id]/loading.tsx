import s from "../complaints.module.css";

export default function Loading() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={`${s.skel} ${s.skelLine}`} />
      <div className={`${s.skel} ${s.skelHero}`} />
      <div className={s.layout}>
        <div className={`${s.skel} ${s.skelPanel}`} />
        <div className={`${s.skel} ${s.skelPanel}`} />
      </div>
    </div>
  );
}