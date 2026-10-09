import s from "./help.module.css";

export default function Loading() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={`${s.skel} ${s.skelHero}`} />
      <div className={`${s.skel} ${s.skelTabs}`} />
      <div className={s.layout}>
        <div className={`${s.skel} ${s.skelList}`} />
        <div className={`${s.skel} ${s.skelList}`} />
      </div>
    </div>
  );
}