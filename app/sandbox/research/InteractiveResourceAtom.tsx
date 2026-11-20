'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import AtomLogo from '@/components/AtomLogo';
import styles from './research.module.css';

export default function InteractiveResourceAtom() {
  const orbitalRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef<number | null>(null);

  const resetMotion = useCallback(() => {
    if (pointerFrameRef.current !== null) {
      cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
    const orbital = orbitalRef.current;
    if (!orbital) return;
    orbital.style.setProperty('--atom-x', '0px');
    orbital.style.setProperty('--atom-y', '0px');
    orbital.style.setProperty('--atom-rotate-x', '0deg');
    orbital.style.setProperty('--atom-rotate-y', '0deg');
    orbital.style.setProperty('--atom-glow-x', '50%');
    orbital.style.setProperty('--atom-glow-y', '50%');
    orbital.removeAttribute('data-pointer-active');
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType === 'touch'
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      resetMotion();
      return;
    }

    const orbital = event.currentTarget;
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const bounds = orbital.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
      const horizontal = (x - 0.5) * 2;
      const vertical = (y - 0.5) * 2;

      orbital.style.setProperty('--atom-x', `${(horizontal * 12).toFixed(2)}px`);
      orbital.style.setProperty('--atom-y', `${(vertical * 12).toFixed(2)}px`);
      orbital.style.setProperty('--atom-rotate-x', `${(-vertical * 9).toFixed(2)}deg`);
      orbital.style.setProperty('--atom-rotate-y', `${(horizontal * 11).toFixed(2)}deg`);
      orbital.style.setProperty('--atom-glow-x', `${(x * 100).toFixed(1)}%`);
      orbital.style.setProperty('--atom-glow-y', `${(y * 100).toFixed(1)}%`);
      orbital.setAttribute('data-pointer-active', 'true');
    });
  }, [resetMotion]);

  useEffect(() => resetMotion, [resetMotion]);

  return (
    <div
      ref={orbitalRef}
      className={styles.heroOrbital}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetMotion}
      onPointerCancel={resetMotion}
      aria-hidden="true"
    >
      <span className={styles.heroOrbitalMotion}><AtomLogo /></span>
    </div>
  );
}
