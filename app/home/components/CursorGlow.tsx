'use client';

import { useEffect, useRef } from 'react';
import styles from '../home.module.css';

export default function CursorGlow() {
  const glowRef = useRef<HTMLSpanElement>(null);
  const tailRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    let pointerX = -120;
    let pointerY = -120;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let hasPointer = false;
    let directionX = 1;
    let directionY = 0;
    let direction = 0;
    let rafId = 0;
    let idleTimer: ReturnType<typeof setTimeout> | null = null;

    const renderPointer = () => {
      rafId = 0;
      direction = Math.atan2(directionY, directionX);
      const speed = Math.hypot(directionX, directionY);
      const tailScale = Math.min(1.1, 0.42 + speed / 36);

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
      }
      if (tailRef.current) {
        tailRef.current.style.opacity = '0.38';
        tailRef.current.style.transform = `translate3d(${pointerX - 72}px, ${pointerY - 1.5}px, 0) rotate(${direction}rad) scaleX(${tailScale})`;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      if (!hasPointer) {
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        hasPointer = true;
      }
      const dx = event.clientX - lastPointerX;
      const dy = event.clientY - lastPointerY;
      // Smooth only the wake direction, never the cursor position. This keeps
      // the halo attached to the pointer while preventing angular jitter.
      directionX = directionX * 0.72 + dx * 0.28;
      directionY = directionY * 0.72 + dy * 0.28;
      pointerX = event.clientX;
      pointerY = event.clientY;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      glowRef.current?.setAttribute('data-visible', 'true');
      glowRef.current?.setAttribute('data-moving', 'true');
      if (rafId === 0) rafId = requestAnimationFrame(renderPointer);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        glowRef.current?.removeAttribute('data-moving');
        if (tailRef.current) tailRef.current.style.opacity = '0';
      }, 120);
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        glowRef.current?.removeAttribute('data-visible');
        glowRef.current?.removeAttribute('data-moving');
        if (tailRef.current) tailRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerout', onPointerLeave, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      if (idleTimer) clearTimeout(idleTimer);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerout', onPointerLeave);
    };
  }, []);

  return (
    <div className={styles.cursorGlowLayer} aria-hidden="true">
      <span ref={tailRef} className={styles.cursorGlowTail} />
      <span ref={glowRef} className={styles.cursorGlow} />
    </div>
  );
}
