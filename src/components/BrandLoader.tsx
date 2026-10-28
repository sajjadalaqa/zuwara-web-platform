import Image from "next/image";
import styles from "./BrandLoader.module.css";

export default function BrandLoader() {
  return (
    <div className={styles.screen} role="status" aria-live="polite" aria-label="Loading Zuwara">
      <div className={styles.brand}>
        <Image src="/brand/zuwara-logo.png" alt="Zuwara" width={320} height={64} priority className={styles.logo}/>
        <span className={styles.track} aria-hidden="true"><span/></span>
      </div>
    </div>
  );
}
