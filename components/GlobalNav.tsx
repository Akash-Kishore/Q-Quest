'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './GlobalNav.module.css';

export default function GlobalNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'HOME' },
    { href: '/sandbox', label: 'SANDBOX' },
    { href: '/terminal', label: 'TERMINAL' },
  ];

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className={styles.brand}>Q_QUEST</div>
        <div className={styles.navLinks}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
