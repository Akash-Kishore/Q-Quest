'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function rangeProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// ---------------------------------------------------------------------------
// 3D card tilt hook
// ---------------------------------------------------------------------------
function useCardTilt(maxAngle: number = 5) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef(0);
  const current = useRef({ rx: 0, ry: 0 });
  const target = useRef({ rx: 0, ry: 0 });

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      target.current = { rx: -ny * maxAngle, ry: nx * maxAngle };
    },
    [maxAngle]
  );

  const handleLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0 };
  }, []);

  useEffect(() => {
    const animate = () => {
      current.current.rx += (target.current.rx - current.current.rx) * 0.1;
      current.current.ry += (target.current.ry - current.current.ry) * 0.1;
      const card = cardRef.current;
      if (card) {
        card.style.transform = `perspective(800px) rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
      }
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, []);

  return { cardRef, handleMove, handleLeave };
}

// ---------------------------------------------------------------------------
// SelectionReveal — Launch Pad emerges behind the dissolving pixel field.
// Cinematic oversized title settles to a responsive heading (never clips),
// then label / subtitle / cards reveal in sequence. No premature cards.
// ---------------------------------------------------------------------------
export default function SelectionReveal() {
  const { subscribe, reducedMotion } = useHomeScroll();
  const router = useRouter();

  const layerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const card1WrapRef = useRef<HTMLDivElement>(null);
  const card2WrapRef = useRef<HTMLDivElement>(null);
  const interactiveRef = useRef(false);

  // Max cinematic scale for the title, measured from actual text bounds vs the
  // safe viewport region so the oversized initial state can never clip.
  const titleMaxScale = useRef(1);

  const card1Tilt = useCardTilt(5);
  const card2Tilt = useCardTilt(5);

  useEffect(() => {
    const measureTitleScale = () => {
      const el = titleRef.current;
      if (!el) return;
      const prev = el.style.transform;
      el.style.transform = 'none';
      const rect = el.getBoundingClientRect();
      el.style.transform = prev;
      if (rect.width <= 0 || rect.height <= 0) return;
      const safeW = window.innerWidth * 0.9;
      const safeH = window.innerHeight * 0.6;
      const s = Math.min(safeW / rect.width, safeH / rect.height, 3.0);
      titleMaxScale.current = Math.max(1, s);
    };

    measureTitleScale();
    // Re-measure once webfonts have loaded (affects text width).
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measureTitleScale).catch(() => {});
    }
    window.addEventListener('resize', measureTitleScale);

    if (reducedMotion) {
      // Final, readable state — cards accessible, no transition trap.
      if (titleRef.current) {
        titleRef.current.style.transform = 'none';
        titleRef.current.style.opacity = '1';
      }
      [labelRef, subtitleRef, card1WrapRef, card2WrapRef].forEach((r) => {
        if (r.current) {
          r.current.style.clipPath = 'inset(0 0 0% 0)';
          r.current.style.transform = 'none';
          (r.current as HTMLElement).style.pointerEvents = 'auto';
        }
      });
      if (layerRef.current) {
        layerRef.current.style.visibility = 'visible';
        layerRef.current.style.pointerEvents = 'auto';
      }
      return () => window.removeEventListener('resize', measureTitleScale);
    }

    const unsub = subscribe((g: number) => {
      // Layer becomes visible as the pixel field starts thinning
      if (layerRef.current) {
        layerRef.current.style.visibility = g > 0.70 ? 'visible' : 'hidden';
      }

      // --- Title: oversized cinematic settle (scale + rise + fade), 0.74–0.865 ---
      if (titleRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.74, 0.865));
        const scale = lerp(titleMaxScale.current, 1, t);
        const y = lerp(34, 0, t);
        titleRef.current.style.transform = `translateY(${y}px) scale(${scale})`;
        titleRef.current.style.opacity = String(Math.min(1, t * 1.4));
      }

      // --- System label: 0.84–0.91 ---
      if (labelRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.84, 0.91));
        labelRef.current.style.transform = `translateY(${lerp(28, 0, t)}px)`;
        labelRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
      }

      // --- Subtitle: 0.86–0.93 ---
      if (subtitleRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.86, 0.93));
        subtitleRef.current.style.transform = `translateY(${lerp(24, 0, t)}px)`;
        subtitleRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
      }

      // --- Card 1: 0.88–0.955 ---
      if (card1WrapRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.88, 0.955));
        card1WrapRef.current.style.transform = `translateY(${lerp(50, 0, t)}px)`;
        card1WrapRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
        card1WrapRef.current.style.pointerEvents = t > 0.8 ? 'auto' : 'none';
      }

      // --- Card 2: 0.905–0.97 ---
      if (card2WrapRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.905, 0.97));
        card2WrapRef.current.style.transform = `translateY(${lerp(50, 0, t)}px)`;
        card2WrapRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
        card2WrapRef.current.style.pointerEvents = t > 0.8 ? 'auto' : 'none';
      }

      // Enable layer interaction once settled
      if (layerRef.current) {
        const shouldBeInteractive = g > 0.965;
        if (shouldBeInteractive !== interactiveRef.current) {
          interactiveRef.current = shouldBeInteractive;
          layerRef.current.style.pointerEvents = shouldBeInteractive ? 'auto' : 'none';
        }
      }
    });

    return () => {
      unsub();
      window.removeEventListener('resize', measureTitleScale);
    };
  }, [subscribe, reducedMotion]);

  return (
    <div
      ref={layerRef}
      className={styles.selectionLayer}
      style={{ visibility: 'hidden', pointerEvents: 'none' }}
    >
      <div className={styles.selectionContent}>
        {/* Main heading — oversized cinematic settle, revealed behind the pixel curtain */}
        <h2
          ref={titleRef}
          className={styles.selectionTitle}
          style={{ opacity: 0 }}
        >
          Launch Pad
        </h2>

        {/* System label */}
        <span
          ref={labelRef}
          className={styles.selectionSystemLabel}
          style={{ clipPath: 'inset(0 0 100% 0)' }}
        >
          System-01 // Laboratory
        </span>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className={styles.selectionSubtitle}
          style={{ clipPath: 'inset(0 0 100% 0)' }}
        >
          <strong>Ready for your next mission?</strong>
          <br />
          <strong>
            Build, explore, and unlock the fascinating world of quantum computing.
          </strong>
        </p>

        {/* Cards */}
        <div className={styles.selectionCardsGrid}>
          {/* Card 1: Circuit Playground */}
          <div
            ref={card1WrapRef}
            className={styles.cardPerspective}
            style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
          >
            <div
              ref={card1Tilt.cardRef}
              onMouseMove={card1Tilt.handleMove}
              onMouseLeave={card1Tilt.handleLeave}
              onClick={() => router.push('/sandbox/circuit')}
              className={styles.card}
            >
              <div className={styles.cardImageWrap}>
                <img
                  alt="Circuit Playground"
                  className={styles.cardImage}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZ25JnRjxUlIXIkrCNwWIxhTIJe2awdiU0bArXjBfmnUjUhN7NTrfMCzmDtTExMRrfI6E9VDX4CtfIkXdMqu1Q4HL1lvLuDGDDkrHdTA3xpZOdaGySBwgmO-IQJuj6ljVSgyfvK4hvGFI5BeH78QQlycrP7t9DEqRBiSkwc3DZxZo6C6x_xmExP-PO2HdhZSW22o963q1XwAO9GFUoDYqEq820rwwaJ2giFVRnuFXZ-jfnALJIyOExLiaS_fnSDUIayNaP9v6ESgU"
                />
              </div>
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaRow}>
                  <span className={`${styles.cardBadge} ${styles.cardBadgePurple}`}>
                    EXPERIMENTAL-014
                  </span>
                  <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                    bolt
                  </span>
                </div>
                <h3 className={styles.cardTitle}>Circuit Playground</h3>
              </div>
            </div>
          </div>

          {/* Card 2: Research Vault */}
          <div
            ref={card2WrapRef}
            className={styles.cardPerspective}
            style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
          >
            <div
              ref={card2Tilt.cardRef}
              onMouseMove={card2Tilt.handleMove}
              onMouseLeave={card2Tilt.handleLeave}
              onClick={() => router.push('/sandbox/research')}
              className={styles.card}
            >
              <div className={styles.cardImageWrap}>
                <img
                  alt="Research Vault"
                  className={styles.cardImage}
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVdACyLaDxVMWXnb7AlxxJEANtmHWdtVRqAkIRIbm7dlNyxrMHj_Z66g_azl8CrQ0qr0-HcL4hTZXl8fE85bRp6W_SMvFiFC1imGV61g0p_5PnYR9WGrNphln3S9SFKMBWAJ9HBWaSP3ZDB91G8_v-jG9HsM3hxtvUxS3kB0nJJ9zKq7jTQt0-p9M5OJ4rhp_XyzO7uYtqL3aoONUaBd0Di3A-01L3DGm_9c3dlFn9Gd-5V4nXokXHq6-W6tvS1Y4DEDkh2aqkPTHx"
                />
              </div>
              <div className={styles.cardMeta}>
                <div className={styles.cardMetaRow}>
                  <span className={`${styles.cardBadge} ${styles.cardBadgePeach}`}>
                    ARCHIVE-LOG
                  </span>
                  <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                    history_edu
                  </span>
                </div>
                <h3 className={styles.cardTitle}>Research Vault</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
