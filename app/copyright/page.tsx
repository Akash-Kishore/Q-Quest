import type { Metadata } from 'next';
import Link from 'next/link';
import styles from './copyright.module.css';

export const metadata: Metadata = {
  title: 'Copyright & Intellectual Property · Q-Quest',
  description: 'Copyright, proprietary-rights, permissions, and third-party rights information for Q-Quest.',
};

const CONTACT_EMAIL = 'dsce.akashkishore@gmail.com';

export default function CopyrightPage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="Copyright page navigation">
        <Link className={styles.brand} href="/home">Q-QUEST</Link>
        <div>
          <Link href="/about">About</Link>
          <Link href="/sandbox/circuit">Playground</Link>
        </div>
      </nav>

      <header className={styles.hero}>
        <span>LEGAL / COPYRIGHT &amp; IP</span>
        <h1>Original work,<br /><em>clearly reserved.</em></h1>
        <p>
          Copyright © 2026 Akash Kishore. Q-Quest. All rights reserved.
        </p>
      </header>

      <section className={styles.content} aria-label="Copyright information">
        <article>
          <span>01</span>
          <div>
            <h2>Ownership notice</h2>
            <p>
              To the extent they are original and eligible for protection, Q-Quest&apos;s
              source code, documentation, written explanations, interface expression,
              and project-created visual materials are claimed as proprietary works of
              Akash Kishore. Making source code or a website publicly accessible does not
              by itself grant a general license to reuse it.
            </p>
          </div>
        </article>

        <article>
          <span>02</span>
          <div>
            <h2>Rights and limits</h2>
            <p>
              No general permission is granted to copy, modify, distribute, sublicense,
              sell, or commercially exploit proprietary Q-Quest materials. This notice
              does not restrict rights that cannot lawfully be excluded, permissions
              already granted in writing, or legitimate use of independently created
              material. Copyright does not protect abstract ideas, methods, ordinary
              functionality, independently developed similar work, or the project name
              by itself.
            </p>
          </div>
        </article>

        <article>
          <span>03</span>
          <div>
            <h2>Third-party material</h2>
            <p>
              Q-Quest uses third-party software, fonts, services, and externally sourced
              reference material. Those items remain subject to their respective owners&apos;
              terms and licenses and are not claimed as proprietary Q-Quest material. See
              the repository&apos;s <a href="https://github.com/Akash-Kishore/Q-Quest/blob/main/THIRD_PARTY_NOTICES.md" target="_blank" rel="noreferrer">third-party notices</a> for the current audit record.
            </p>
          </div>
        </article>

        <article>
          <span>04</span>
          <div>
            <h2>Permissions and reports</h2>
            <p>
              To request written permission, or to report suspected infringement involving
              Q-Quest, email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Include
              the material involved, the intended use or location, your contact details,
              and any supporting links. A request is not approved unless express written
              authorization is provided.
            </p>
          </div>
        </article>
      </section>

      <aside className={styles.disclaimer}>
        <strong>Important</strong>
        <p>
          These notices document the project&apos;s licensing position; they are not legal
          advice, government registration, certification of ownership, or a promise that
          copying can be prevented.
        </p>
      </aside>

      <footer className={styles.footer}>
        <span>© 2026 Akash Kishore. Q-Quest. All rights reserved.</span>
        <Link href="/home">Return home</Link>
      </footer>
    </main>
  );
}
