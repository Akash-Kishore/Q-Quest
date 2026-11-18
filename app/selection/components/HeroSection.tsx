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
  const initialScaleRef = useRef(1);

  useEffect(() => {
    let lastProgress = 0;

    const measureInitialScale = () => {
      const inner = innerRef.current;
      if (!inner) return;

      const previousTransform = inner.style.transform;
      inner.style.transform = 'none';
      const rect = inner.getBoundingClientRect();
      inner.style.transform = previousTransform;

      if (rect.width > 0 && rect.height > 0) {
        const widthScale = (window.innerWidth * 0.9) / rect.width;
        const heightScale = (window.innerHeight * 0.78) / rect.height;
        initialScaleRef.current = Math.max(
          0.8,
          Math.min(1.65, widthScale, heightScale)
        );
      }
    };

    const applyProgress = (progress: number) => {
      const inner = innerRef.current;
      const subtitle = subtitleRef.current;
      const label = labelRef.current;
      if (!inner) return;

      lastProgress = progress;
      const initialScale = initialScaleRef.current;
      const scale = initialScale - progress * (initialScale - 0.65);
      const translateY = progress * -30;
      const translateZ = progress * -50;
      // Clear the hero before the cards become interactive so headings never
      // obscure card artwork or controls on compact screens.
      const opacity = Math.max(0, 1 - progress * 2);

      inner.style.transform = `scale(${scale}) translateY(${translateY}vh) translateZ(${translateZ}px)`;
      inner.style.opacity = `${opacity}`;

      if (subtitle) {
        subtitle.style.opacity = `${Math.max(0, 1 - progress * 2.5)}`;
      }

      if (label) {
        label.style.opacity = `${Math.max(0, 1 - progress * 3)}`;
      }
    };

    const handleResize = () => {
      measureInitialScale();
      applyProgress(lastProgress);
    };

    measureInitialScale();

    if (reducedMotion) {
      // Show hero in its small final state
      if (innerRef.current) {
        innerRef.current.style.transform = 'scale(0.65) translateY(-30vh) translateZ(-50px)';
        innerRef.current.style.opacity = '0';
      }
      if (subtitleRef.current) subtitleRef.current.style.opacity = '0';
      if (labelRef.current) labelRef.current.style.opacity = '0';
      return;
    }

    applyProgress(0);
    window.addEventListener('resize', handleResize);
    document.fonts?.ready.then(handleResize).catch(() => {});
    const unsub = subscribe(applyProgress);

    return () => {
      unsub();
      window.removeEventListener('resize', handleResize);
    };
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
