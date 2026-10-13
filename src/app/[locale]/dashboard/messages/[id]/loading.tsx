import s from "../messages.module.css";

export default function Loading() {
  return (
    <div className={s.chat} aria-busy="true">
      <div className={s.chatHead}>
        <div className={`${s.skel} ${s.skelAvatar}`} />
        <div className={`${s.skel} ${s.skelLine}`} />
      </div>
      <div className={s.body}>
        <div className={`${s.skel} ${s.skelBubble}`} style={{ width: "60%" }} />
        <div className={`${s.skel} ${s.skelBubble}`} style={{ width: "45%", alignSelf: "flex-end" }} />
        <div className={`${s.skel} ${s.skelBubble}`} style={{ width: "70%" }} />
      </div>
    </div>
  );
}