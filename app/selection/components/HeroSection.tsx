'use client';

import { useRef, useEffect } from 'react';
import { useScrollContext } from './ScrollController';
import styles from '../selection.module.css';

export default function HeroSection() {
  const { subscribe, reducedMotion } = useScrollContext();
  const innerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      // Show hero in its small final state
      if (innerRef.current) {
        innerRef.current.style.transform = 'scale(0.65) translateY(-30vh) translateZ(-50px)';
        innerRef.current.style.opacity = '0.5';
      }
      if (subtitleRef.current) subtitleRef.current.style.opacity = '0';
      if (labelRef.current) labelRef.current.style.opacity = '0';
      return;
    }

    const unsub = subscribe((progress: number) => {
      const inner = innerRef.current;
      const subtitle = subtitleRef.current;
      const label = labelRef.current;
      if (!inner) return;

      // --- Scale: 2.5 → 0.65 ---
      const scale = 2.5 - progress * 1.85;

      // --- TranslateY: 0 → -30vh ---
      const translateY = progress * -30;

      // --- TranslateZ for depth: 0 → -50px ---
      const translateZ = progress * -50;

      // --- Opacity: 1 → 0.5 ---
      const opacity = 1 - progress * 0.5;

      inner.style.transform = `scale(${scale}) translateY(${translateY}vh) translateZ(${translateZ}px)`;
      inner.style.opacity = `${opacity}`;

      // --- Subtitle fades out by 0.5 ---
      if (subtitle) {
        const subtitleOpacity = Math.max(0, 1 - progress * 2.5);
        subtitle.style.opacity = `${subtitleOpacity}`;
      }

      // --- System label fades out by 0.35 ---
      if (label) {
        const labelOpacity = Math.max(0, 1 - progress * 3);
        label.style.opacity = `${labelOpacity}`;
      }
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  return (
    <div className={styles.heroSection}>
      <div className={styles.heroInner} ref={innerRef}>
        <span className={styles.systemLabel} ref={labelRef}>
          System-01 // Laboratory
        </span>
        <h2 className={styles.heroTitle} ref={titleRef}>
          Launch Pad
        </h2>
        <p className={styles.heroSubtitle} ref={subtitleRef}>
          <strong>Ready for your next mission?</strong>
          <br />
          <strong>
            Build, explore, and unlock the fascinating world of quantum
            computing.
          </strong>
        </p>
      </div>
    </div>
  );
}
