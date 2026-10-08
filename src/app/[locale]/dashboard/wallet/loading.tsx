import s from "./wallet.module.css";

export default function Loading() {
  return (
    <div className={s.page} aria-busy="true">
      <div className={`${s.skel} ${s.skelHead}`} />
      <div className={`${s.skel} ${s.skelHero}`} />
      <div className={`${s.skel} ${s.skelList}`} />
    </div>
  );
}