import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import InteractiveResourceBrand from './InteractiveResourceBrand';
import InteractiveResourceAtom from './InteractiveResourceAtom';
import styles from './research.module.css';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Quantum Resources · Q-Quest',
  description: 'Explore curated Beyond the Bit essays on quantum computing, mathematics, and code.',
};

type Post = {
  title: string;
  description: string;
  link: string;
  image: string;
  date: string;
  categories: string[];
};

const BLOG_URL = 'https://beyond-the-bit.hashnode.dev/';
const RSS_URL = `${BLOG_URL}rss.xml`;

function cleanXml(value: string) {
  return value
    .replace(/^<!\[CDATA\[/, '')
    .replace(/\]\]>$/, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
}

function readTag(item: string, tag: string) {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? cleanXml(match[1]) : '';
}

async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch(RSS_URL, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const xml = await response.text();
    return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)]
      .map((match) => {
        const item = match[1];
        const enclosure = item.match(/<enclosure[^>]+url="([^"]+)"/i)?.[1] ?? '';
        const categories = [...item.matchAll(/<category>([\s\S]*?)<\/category>/gi)]
          .map((category) => cleanXml(category[1]))
          .filter(Boolean)
          .slice(0, 2);
        return {
          title: readTag(item, 'title'),
          description: readTag(item, 'description'),
          link: readTag(item, 'link'),
          image: enclosure,
          date: readTag(item, 'pubDate'),
          categories,
        };
      })
      .sort((a, b) => {
        const newer = new Date(b.date).getTime();
        const older = new Date(a.date).getTime();
        return (Number.isNaN(newer) ? 0 : newer) - (Number.isNaN(older) ? 0 : older);
      })
      .slice(0, 10);
  } catch {
    return [];
  }
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Beyond the Bit';
  return new Intl.DateTimeFormat('en', { month: 'short', day: '2-digit', year: 'numeric' }).format(parsed);
}

export default async function ResearchSandboxPage() {
  const posts = await getPosts();
  const [featured, ...rest] = posts;

  return (
    <main className={styles.page} data-theme-root>
      <nav className={styles.nav}>
        <InteractiveResourceBrand />
        <div className={styles.navLinks}>
          <Link href="/sandbox/circuit">Circuit playground</Link>
          <ThemeToggle className={styles.themeToggle} />
          <a className={styles.primary} href={BLOG_URL} target="_blank" rel="noreferrer">Visit publication</a>
        </div>
      </nav>

      <header className={styles.hero}>
        <InteractiveResourceAtom />
        <div>
          <span className={styles.eyebrow}>Q-QUEST RESOURCES / LIVE ARCHIVE</span>
          <h1>Resources <em>for quantum<span className={styles.mobileBreak}><br /></span> minds.</em></h1>
        </div>
        <div className={styles.heroAside}>
          <p>A calm, curated path through quantum computing—one vector, gate, and strange idea at a time.</p>
          <a href={BLOG_URL} target="_blank" rel="noreferrer">Read the publication</a>
        </div>
      </header>

      <section className={styles.feed}>
        <div className={styles.sectionHead}>
          <div><span className={styles.index}>01 / LATEST SIGNALS</span><h2>Field notes from the quantum edge.</h2></div>
          <span>{posts.length ? `${posts.length} ARTICLES SYNCED` : 'PUBLICATION LINKED'}</span>
        </div>

        {featured ? (
          <>
            <a className={styles.featured} href={featured.link} target="_blank" rel="noreferrer">
              <div className={styles.featuredImage}>
                {featured.image && <Image src={featured.image} alt="" fill sizes="(max-width: 900px) 100vw, 60vw" priority />}
              </div>
              <div className={styles.featuredCopy}>
                <div>
                  <div className={styles.meta}>
                    <span>{formatDate(featured.date)}</span><span>•</span><span>{featured.categories.join(' / ') || 'Quantum computing'}</span>
                  </div>
                  <h3>{featured.title}</h3>
                  <p>{featured.description}</p>
                </div>
                <span className={styles.read}>Read the latest signal <b>Open</b></span>
              </div>
            </a>

            <div className={styles.grid}>
              {rest.map((post, index) => (
                <a
                  className={styles.card}
                  href={post.link}
                  target="_blank"
                  rel="noreferrer"
                  key={post.link}
                  style={{ '--delay': index } as CSSProperties}
                >
                  <div className={styles.cardImage}>
                    {post.image && <Image src={post.image} alt="" fill sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw" />}
                  </div>
                  <div className={styles.cardCopy}>
                    <div className={styles.meta}><span>{String(index + 2).padStart(2, '0')}</span><span>{formatDate(post.date)}</span></div>
                    <h3>{post.title}</h3>
                    <div className={styles.meta}><span>{post.categories.join(' / ') || 'Quantum computing'}</span><span>Open</span></div>
                  </div>
                </a>
              ))}
            </div>
          </>
        ) : (
          <div className={styles.empty}>
            <p>The live archive is taking a quantum pause.</p>
            <a href={BLOG_URL} target="_blank" rel="noreferrer">Open Beyond the Bit directly</a>
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <span>Q-Quest Resources</span><span>Feed source: Beyond the Bit · Hashnode</span>
      </footer>
    </main>
  );
}
