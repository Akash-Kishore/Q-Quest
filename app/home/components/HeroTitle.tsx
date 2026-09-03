'use client';

import { useRef, useEffect } from 'react';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Easing helpers
// ---------------------------------------------------------------------------
function easeInCubic(t: number): number {
  return t * t * t;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function rangeProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

// ---------------------------------------------------------------------------
// HeroTitle — Q_QUEST typography with spatial exit (never fades)
// ---------------------------------------------------------------------------
export default function HeroTitle() {
  const { subscribe, reducedMotion } = useHomeScroll();

  const layerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const techTLRef = useRef<HTMLDivElement>(null);
  const techTRRef = useRef<HTMLDivElement>(null);
  const techBLRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      // Hide title in reduced motion final state
      if (layerRef.current) layerRef.current.style.display = 'none';
      return;
    }

    const unsub = subscribe((progress: number) => {
      const inner = innerRef.current;
      if (!inner) return;

      // Q_QUEST exit: 0.05 → 0.35 — accelerating upward movement
      // Title moves from translateY(0) to translateY(-110vh)
      // Opacity remains 1.0 at ALL times
      let titleY: number;
      if (progress < 0.05) {
        titleY = 0;
      } else if (progress > 0.35) {
        titleY = -110;
      } else {
        const t = rangeProgress(progress, 0.05, 0.35);
        titleY = -110 * easeInCubic(t); // accelerates as it exits
      }

      inner.style.transform = `translateY(${titleY}vh)`;
      // Opacity is ALWAYS 1.0 — title exits by position, not by fading
      inner.style.opacity = '1';

      // Hide layer entirely when off-screen for performance
      if (layerRef.current) {
        layerRef.current.style.visibility = progress > 0.38 ? 'hidden' : 'visible';
      }

      // Tech overlays exit at slightly different rates for depth
      if (techTLRef.current) {
        let techY: number;
        if (progress < 0.04) techY = 0;
        else if (progress > 0.30) techY = -100;
        else techY = -100 * easeInCubic(rangeProgress(progress, 0.04, 0.30));
        techTLRef.current.style.transform = `translateY(${techY}vh)`;
      }

      if (techTRRef.current) {
        let techY: number;
        if (progress < 0.06) techY = 0;
        else if (progress > 0.32) techY = -105;
        else techY = -105 * easeInCubic(rangeProgress(progress, 0.06, 0.32));
        techTRRef.current.style.transform = `translateY(${techY}vh)`;
      }

      if (techBLRef.current) {
        let techY: number;
        if (progress < 0.08) techY = 0;
        else if (progress > 0.34) techY = -115;
        else techY = -115 * easeInCubic(rangeProgress(progress, 0.08, 0.34));
        techBLRef.current.style.transform = `translateY(${techY}vh)`;
      }
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  return (
    <div ref={layerRef} className={styles.heroTitleLayer}>
      <div ref={innerRef} className={styles.heroTitleInner}>
        <span className={styles.heroLetters}>Q_QUEST</span>
      </div>

      {/* Technical HUD overlays — exit at different rates for depth */}
      <div ref={techTLRef} className={`${styles.heroTechOverlay} ${styles.heroTechTL}`}>
        MODULAR_SPACE_GRID // GRAPH_HUD_V2
      </div>
      <div ref={techTRRef} className={`${styles.heroTechOverlay} ${styles.heroTechTR}`}>
        REFRACTION_INDEX: 1.62_FLINT_GLASS
      </div>
      <div ref={techBLRef} className={`${styles.heroTechOverlay} ${styles.heroTechBL}`}>
        DEEP_SPACE_PULSE: 0xFF
      </div>
    </div>
  );
}
