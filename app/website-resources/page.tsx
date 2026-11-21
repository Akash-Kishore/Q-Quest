import type { Metadata } from 'next';
import Link from 'next/link';
import InteractiveBrand from '@/components/InteractiveBrand';
import styles from './resources.module.css';

export const metadata: Metadata = {
  title: 'Resources & Copyright · Q-Quest',
  description: 'Q-Quest source resources, copyright notice, and permission information.',
};

const REPOSITORY_URL = 'https://github.com/Akash-Kishore/Q-Quest';
const COPYRIGHT_URL = `${REPOSITORY_URL}/blob/main/COPYRIGHT.md`;
const CONTACT_EMAIL = 'dsce.akashkishore@gmail.com';

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
        <span>01 / RESOURCES &amp; COPYRIGHT</span>
        <h1 id="resources-title">Source and rights,<br />in one place.</h1>
        <p>
          Inspect Q-Quest on GitHub. Eligible original project code and content
          remain proprietary and all rights are reserved; public access is not a
          general reuse license, and third-party rights remain unaffected.
        </p>
        <div className={styles.actions}>
          <a href={REPOSITORY_URL} target="_blank" rel="noreferrer">
            Open GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href={COPYRIGHT_URL} target="_blank" rel="noreferrer">
            Copyright notice <span aria-hidden="true">↗</span>
          </a>
        </div>
        <aside id="copyright" className={styles.legalNote}>
          <strong>© 2026 Akash Kishore. Q-Quest. All rights reserved.</strong>
          <span>Permissions or infringement reports: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></span>
        </aside>
      </section>

      <footer className={styles.footer}>
        <strong>Q-QUEST</strong>
        <span>Resources &amp; copyright</span>
        <span>Source and rights · 2026</span>
      </footer>
    </main>
  );
}
