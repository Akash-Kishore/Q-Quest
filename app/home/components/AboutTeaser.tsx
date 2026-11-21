import Image from 'next/image';
import Link from 'next/link';
import AtomLogo from '@/components/AtomLogo';
import styles from '../home.module.css';

export default function AboutTeaser() {
  return (
    <section className={styles.aboutTeaser} aria-labelledby="about-teaser-title">
      <div className={styles.aboutGlow} aria-hidden="true" />
      <div className={styles.aboutGrid} aria-hidden="true" />

      <div className={styles.aboutTeaserIntro}>
        <span className={styles.aboutIndex}>03 / BEHIND Q-QUEST</span>
        <h2 id="about-teaser-title">
          A curious mind<br />
          <em>behind the particles.</em>
        </h2>
        <p>
          Akash Kishore is an Electronics and Telecommunication Engineering
          student at Dayananda Sagar College of Engineering. He explores quantum
          computing, artificial intelligence, and software through independent projects.
        </p>
        <Link className={styles.aboutPrimaryLink} href="/about">
          <span>Meet the creator</span>
          <span aria-hidden="true">About</span>
        </Link>
      </div>

      <div className={styles.aboutOrbit} aria-hidden="true">
        <span />
        <span />
        <AtomLogo />
      </div>

      <footer className={styles.aboutFooter}>
        <div className={styles.aboutIdentity}>
          <Image
            className={styles.aboutPortrait}
            src="/images/akash-kishore-profile.jpg"
            alt="Akash Kishore"
            width={400}
            height={400}
            sizes="56px"
          />
          <strong>Akash Kishore</strong>
          <span>Creator of Q-QUEST</span>
          <small>Make difficult ideas tangible.</small>
          <Link className={styles.aboutCopyright} href="/copyright">
            © 2026 Akash Kishore. Q-Quest. All rights reserved.
          </Link>
        </div>

        <div className={styles.aboutLinkColumn}>
          <span>Explore</span>
          <Link href="/home">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/sandbox/circuit">Circuit playground</Link>
          <Link href="/sandbox/research">Resources</Link>
          <Link href="/website-resources">Website resources</Link>
          <Link href="/copyright">Copyright &amp; IP</Link>
        </div>

        <div className={styles.aboutLinkColumn}>
          <span>Connect</span>
          <a href="mailto:dsce.akashkishore@gmail.com">Email</a>
          <a href="https://github.com/Akash-Kishore" target="_blank" rel="noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/akashkishore/" target="_blank" rel="noreferrer">LinkedIn</a>
          <a href="https://orcid.org/0009-0005-8128-5355" target="_blank" rel="noreferrer">ORCID</a>
        </div>

        <div className={styles.aboutLinkColumn}>
          <span>Profiles</span>
          <a href="https://beyond-the-bit.hashnode.dev/" target="_blank" rel="noreferrer">
            Beyond the Bit
          </a>
          <Link className={styles.aboutPlaceholderLink} href="/about#profile-links" aria-disabled="true" tabIndex={-1}>
            arXiv / coming soon
          </Link>
          <Link className={styles.aboutPlaceholderLink} href="/about#profile-links" aria-disabled="true" tabIndex={-1}>
            Resume / coming soon
          </Link>
        </div>
      </footer>
    </section>
  );
}
