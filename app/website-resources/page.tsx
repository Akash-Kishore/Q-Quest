import type { Metadata } from 'next';
import Link from 'next/link';
import InteractiveBrand from '@/components/InteractiveBrand';
import styles from './resources.module.css';

export const metadata: Metadata = {
  title: 'Website Resources · Q-Quest',
  description: 'View the source repository for the Q-Quest website.',
};

const REPOSITORY_URL = 'https://github.com/Akash-Kishore/Q-Quest';

export default function WebsiteResourcesPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Primary navigation">
        <InteractiveBrand
          className={styles.brand}
          markClassName={styles.brandMark}
          labelClassName={styles.brandLabel}
        />
        <div className={styles.navLinks}>
          <Link href="/home">Home</Link>
          <Link href="/about">About</Link>
        </div>
      </nav>

      <section className={styles.resource} aria-labelledby="resources-title">
        <div className={styles.grid} aria-hidden="true" />
        <span>01 / WEBSITE RESOURCES</span>
        <h1 id="resources-title">The source is open for inspection.</h1>
        <p>
          View the code, project structure, and development history for the
          Q-QUEST website in its GitHub repository.
        </p>
        <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
          Open Q-QUEST on GitHub
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <strong>Q-QUEST</strong>
        <span>Website resources</span>
        <span>Source repository · 2026</span>
      </footer>
    </main>
  );
}
