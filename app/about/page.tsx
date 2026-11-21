import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import InteractiveBrand from '@/components/InteractiveBrand';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Akash Kishore · Q-Quest',
  description: 'Learn about Q-Quest, its creator Akash Kishore, and his educational background.',
};

const profileLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/Akash-Kishore',
    note: 'Code and project work',
  },
  {
    label: 'Beyond the Bit',
    href: 'https://beyond-the-bit.hashnode.dev/',
    note: 'Quantum field notes and essays',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/akashkishore/',
    note: 'Professional profile',
  },
  {
    label: 'ORCID',
    href: 'https://orcid.org/0009-0005-8128-5355',
    note: 'Research identity',
  },
  {
    label: 'arXiv',
    href: '/about#profile-links',
    note: 'Profile coming soon',
    placeholder: true,
  },
  {
    label: 'Resume',
    href: '/about#profile-links',
    note: 'PDF coming soon',
    placeholder: true,
  },
];

export default function AboutPage() {
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
          <Link href="/website-resources">Resources &amp; copyright</Link>
          <Link href="/sandbox/circuit">Playground</Link>
          <Link href="/sandbox/research">Learning resources</Link>
        </div>
      </nav>

      <section className={styles.siteIntro} aria-labelledby="site-intro-title">
        <div className={styles.siteIntroLabel}>01 / ABOUT Q-QUEST</div>
        <h1 id="site-intro-title">Quantum computing, made visible.</h1>
        <div className={styles.siteIntroDescription}>
          <p>
            Q-QUEST is a beginner-friendly learning space that makes quantum
            computing easier to understand in detail. It breaks down circuits,
            gates, state vectors, and matrices through clear explanations and
            interactive visuals, helping learners explore how each concept works
            instead of only reading about it.
          </p>
          <div className={styles.siteIntroActions}>
            <Link href="/sandbox/circuit">Open the circuit playground</Link>
            <Link href="/sandbox/research">Browse learning resources</Link>
          </div>
        </div>
        <Link className={styles.siteIntroScroll} href="#creator">Meet the creator ↓</Link>
      </section>

      <section id="profile-links" className={styles.profile} aria-labelledby="creator-title">
        <header id="creator" className={styles.creatorHeader}>
          <div className={styles.sectionLabel}>02 / CREATOR</div>
          <h2 id="creator-title">Creator</h2>
        </header>

        <div className={styles.profileLinkGrid} aria-label="Akash Kishore online profiles">
          {profileLinks.map((profile, index) => (
            <a
              key={profile.label}
              className={profile.placeholder ? styles.profileLinkPlaceholder : styles.profileLink}
              href={profile.href}
              target={profile.placeholder ? undefined : '_blank'}
              rel={profile.placeholder ? undefined : 'noreferrer'}
              aria-disabled={profile.placeholder || undefined}
              tabIndex={profile.placeholder ? -1 : undefined}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <strong>{profile.label}</strong>
                <small>{profile.note}</small>
              </div>
              <i aria-hidden="true">{profile.placeholder ? 'SOON' : '↗'}</i>
            </a>
          ))}
        </div>

        <div className={styles.profileIntro}>
          <Image
            className={styles.profilePhoto}
            src="/images/akash-kishore-profile.jpg"
            alt="Akash Kishore"
            width={400}
            height={400}
            sizes="(max-width: 620px) 168px, 304px"
            preload
          />
          <div className={styles.profileTagline}>
            <h3>Engineering, computation, and quantum curiosity.</h3>
          </div>
        </div>
      </section>

      <section className={styles.education} aria-labelledby="education-title">
        <div className={styles.educationIntro}>
          <div id="education-title" className={styles.sectionLabel}>03 / EDUCATION</div>
          <p className={styles.educationBio}>
            I&apos;m an Electronics and Telecommunication Engineering student at
            DSCE, Bengaluru. I like learning by building, whether that means
            experimenting with robotics and Edge AI, studying real communication
            systems, or working through quantum computing with Qiskit. I document
            the journey through my blog, Beyond the Bit.
          </p>
        </div>

        <div className={styles.educationDetails}>
          <article>
            <span>Institution</span>
            <strong>Dayananda Sagar College of Engineering</strong>
            <small>Bengaluru, Karnataka</small>
          </article>
          <article>
            <span>Program</span>
            <strong>Electronics and Telecommunication Engineering</strong>
            <small>Engineering education</small>
          </article>
          <article>
            <span>Academic interests</span>
            <strong>Quantum computing, AI, and machine learning</strong>
            <small>Independent study and project work</small>
          </article>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={styles.contactGlow} aria-hidden="true" />
        <div className={styles.sectionLabel}>04 / CONTACT</div>
        <h2 id="contact-title">Let&apos;s talk.</h2>
        <p>For questions, collaborations, or a conversation about my work, email me at:</p>
        <a href="mailto:dsce.akashkishore@gmail.com">
          dsce.akashkishore@gmail.com
          <span aria-hidden="true">↗</span>
        </a>
      </section>

      <footer className={styles.footer}>
        <strong>Akash Kishore</strong>
        <span>Electronics and Telecommunication Engineering</span>
        <span>Bengaluru, India · 2026</span>
      </footer>
    </main>
  );
}
