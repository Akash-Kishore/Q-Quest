import InteractiveBrand from '@/components/InteractiveBrand';
import styles from './research.module.css';

export default function InteractiveResourceBrand() {
  return (
    <InteractiveBrand
      className={styles.brand}
      markClassName={styles.brandMark}
      labelClassName={styles.brandLabel}
    />
  );
}
