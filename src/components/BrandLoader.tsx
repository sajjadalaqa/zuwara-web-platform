import { useUiText } from "@/i18n/use-ui-text";
import Image from "next/image";
import styles from "./BrandLoader.module.css";

export default function BrandLoader() {
  const uiText = useUiText();
  return (
    <div className={styles.screen} role="status" aria-live="polite" aria-label={uiText("Loading Zuwara")}>
      <div className={styles.brand}>
        <Image src="/brand/zuwara-logo.svg" alt="Zuwara" width={402} height={84} unoptimized priority className={styles.logo}/>
        <span className={styles.track} aria-hidden="true"><span/></span>
      </div>
    </div>
  );
}
