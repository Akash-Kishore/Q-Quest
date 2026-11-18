'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useScrollContext } from './ScrollController';
import styles from '../selection.module.css';

// ---------------------------------------------------------------------------
// 3D tilt hook — cursor relative to card center drives rotateX/Y
// ---------------------------------------------------------------------------
function useCardTilt(maxAngle: number = 5, enabled: boolean = true) {
  const cardRef = useRef<HTMLButtonElement>(null);
  const rafId = useRef<number>(0);
  const current = useRef({ rx: 0, ry: 0 });
  const target = useRef({ rx: 0, ry: 0 });

  const animate = useCallback(function updateTilt() {
    current.current.rx += (target.current.rx - current.current.rx) * 0.1;
    current.current.ry += (target.current.ry - current.current.ry) * 0.1;

    const card = cardRef.current;
    if (card) {
      card.style.transform = `perspective(800px) rotateX(${current.current.rx}deg) rotateY(${current.current.ry}deg)`;
    }

    const stillMoving =
      Math.abs(target.current.rx - current.current.rx) > 0.01 ||
      Math.abs(target.current.ry - current.current.ry) > 0.01;
    rafId.current = stillMoving ? requestAnimationFrame(updateTilt) : 0;
  }, []);

  const requestTiltFrame = useCallback(() => {
    if (enabled && rafId.current === 0) {
      rafId.current = requestAnimationFrame(animate);
    }
  }, [animate, enabled]);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!enabled) return;
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalized -1 to 1
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      target.current = {
        rx: -ny * maxAngle, // tilt up/down
        ry: nx * maxAngle,  // tilt left/right
      };
      requestTiltFrame();
    },
    [enabled, maxAngle, requestTiltFrame]
  );

  const handleLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0 };
    requestTiltFrame();
  }, [requestTiltFrame]);

  useEffect(() => {
    if (!enabled) cancelAnimationFrame(rafId.current);
    return () => cancelAnimationFrame(rafId.current);
  }, [enabled]);

  return { cardRef, handleMove, handleLeave };
}

// ---------------------------------------------------------------------------
// CardsSection
// ---------------------------------------------------------------------------
export default function CardsSection() {
  const router = useRouter();
  const { subscribe, reducedMotion } = useScrollContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  const {
    cardRef: card1Ref,
    handleMove: handleCard1Move,
    handleLeave: handleCard1Leave,
  } = useCardTilt(5, !reducedMotion);
  const {
    cardRef: card2Ref,
    handleMove: handleCard2Move,
    handleLeave: handleCard2Leave,
  } = useCardTilt(5, !reducedMotion);

  // Scroll-driven reveal: cards scale/translate/opacity
  useEffect(() => {
    if (reducedMotion) {
      // Show cards immediately in final state
      if (sectionRef.current) {
        sectionRef.current.style.opacity = '1';
        sectionRef.current.style.transform = 'translateY(0) scale(1)';
        sectionRef.current.style.pointerEvents = 'auto';
      }
      return;
    }

    const unsub = subscribe((progress: number) => {
      const section = sectionRef.current;
      if (!section) return;

      // Cards fade in from scroll 0.3 → 0.8
      const cardStart = 0.3;
      const cardEnd = 0.8;
      const cardProgress = Math.max(
        0,
        Math.min(1, (progress - cardStart) / (cardEnd - cardStart))
      );

      // Ease out cubic
      const eased = 1 - Math.pow(1 - cardProgress, 3);

      const opacity = eased;
      const translateY = (1 - eased) * 80; // 80px → 0
      const scale = 0.85 + eased * 0.15; // 0.85 → 1.0

      section.style.opacity = `${opacity}`;
      section.style.transform = `translateY(${translateY}px) scale(${scale})`;
      section.style.pointerEvents = cardProgress > 0.5 ? 'auto' : 'none';
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  return (
    <div className={styles.cardsSection}>
      <div className={styles.cardsGrid} ref={sectionRef} style={{ opacity: 0 }}>
        {/* Card 1: Circuit Playground */}
        <div className={styles.cardPerspective}>
          <button
            type="button"
            ref={card1Ref}
            onMouseMove={handleCard1Move}
            onMouseLeave={handleCard1Leave}
            onClick={() => router.push('/sandbox/circuit')}
            className={`${styles.card} appearance-none border-0 p-0 text-left`}
          >
            <div className={styles.cardImageWrap}>
              <Image
                alt="Circuit Playground"
                className={styles.cardImage}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZ25JnRjxUlIXIkrCNwWIxhTIJe2awdiU0bArXjBfmnUjUhN7NTrfMCzmDtTExMRrfI6E9VDX4CtfIkXdMqu1Q4HL1lvLuDGDDkrHdTA3xpZOdaGySBwgmO-IQJuj6ljVSgyfvK4hvGFI5BeH78QQlycrP7t9DEqRBiSkwc3DZxZo6C6x_xmExP-PO2HdhZSW22o963q1XwAO9GFUoDYqEq820rwwaJ2giFVRnuFXZ-jfnALJIyOExLiaS_fnSDUIayNaP9v6ESgU"
              />
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.cardMetaRow}>
                <span
                  className={`${styles.cardBadge} ${styles.cardBadgePurple}`}
                >
                  EXPERIMENTAL-014
                </span>
                <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                  bolt
                </span>
              </div>
              <h3 className={styles.cardTitle}>Circuit Playground</h3>
            </div>
          </button>
        </div>

        {/* Card 2: Research Vault */}
        <div className={styles.cardPerspective}>
          <button
            type="button"
            ref={card2Ref}
            onMouseMove={handleCard2Move}
            onMouseLeave={handleCard2Leave}
            onClick={() => router.push('/sandbox/research')}
            className={`${styles.card} appearance-none border-0 p-0 text-left`}
          >
            <div className={styles.cardImageWrap}>
              <Image
                alt="Research Vault"
                className={styles.cardImage}
                fill
                sizes="(max-width: 768px) 90vw, 400px"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVdACyLaDxVMWXnb7AlxxJEANtmHWdtVRqAkIRIbm7dlNyxrMHj_Z66g_azl8CrQ0qr0-HcL4hTZXl8fE85bRp6W_SMvFiFC1imGV61g0p_5PnYR9WGrNphln3S9SFKMBWAJ9HBWaSP3ZDB91G8_v-jG9HsM3hxtvUxS3kB0nJJ9zKq7jTQt0-p9M5OJ4rhp_XyzO7uYtqL3aoONUaBd0Di3A-01L3DGm_9c3dlFn9Gd-5V4nXokXHq6-W6tvS1Y4DEDkh2aqkPTHx"
              />
            </div>
            <div className={styles.cardMeta}>
              <div className={styles.cardMetaRow}>
                <span
                  className={`${styles.cardBadge} ${styles.cardBadgePeach}`}
                >
                  ARCHIVE-LOG
                </span>
                <span className={`material-symbols-outlined ${styles.cardIcon}`}>
                  history_edu
                </span>
              </div>
              <h3 className={styles.cardTitle}>Research Vault</h3>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
