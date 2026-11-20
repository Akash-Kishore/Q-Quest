'use client';

import { useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const saved = localStorage.getItem('qquest-theme');
    const preferred = saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const root = buttonRef.current?.closest<HTMLElement>('[data-theme-root]');
    if (root) root.dataset.theme = preferred;
    const timer = window.setTimeout(() => setTheme(preferred), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('qquest-theme', nextTheme);
    const root = buttonRef.current?.closest<HTMLElement>('[data-theme-root]');
    if (root) root.dataset.theme = nextTheme;
    setTheme(nextTheme);
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      className={className}
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'dark'}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      suppressHydrationWarning
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
