'use client';

import { useRef, useEffect } from 'react';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// HUD Grid — participates in the cinematic transition
// ---------------------------------------------------------------------------
export default function HudGrid() {
  const { subscribe, reducedMotion } = useHomeScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Generate grid modules
    const totalSlots = 12 * 8;
    const occupied = new Set<number>();

    for (let i = 0; i < totalSlots; i++) {
      if (occupied.has(i)) continue;

      const row = Math.floor(i / 12);
      const col = i % 12;

      const mod = document.createElement('div');
      mod.className = styles.hudModule;

      // Chance for a large module (2x2)
      if (col < 11 && row < 7 && Math.random() > 0.85) {
        mod.classList.add(styles.hudModuleLarge);
        occupied.add(i);
        occupied.add(i + 1);
        occupied.add(i + 12);
        occupied.add(i + 13);
      } else {
        occupied.add(i);
      }

      if (Math.random() > 0.8) {
        mod.classList.add(styles.hudModuleAccent);
      }

      const label = document.createElement('div');
      label.className = styles.hudModuleInner;
      label.textContent = Math.random() > 0.5
        ? 'MOD_' + Math.floor(Math.random() * 99)
        : '0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase();
      mod.appendChild(label);

      container.appendChild(mod);
    }

    // Pulse random modules for activity
    pulseIntervalRef.current = setInterval(() => {
      const modules = container.querySelectorAll(`.${styles.hudModule}`);
      const idx = Math.floor(Math.random() * modules.length);
      const m = modules[idx] as HTMLElement | undefined;
      if (m) {
        m.style.background = 'rgba(255, 255, 255, 0.05)';
        m.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        setTimeout(() => {
          if (m) {
            m.style.background = 'rgba(255, 255, 255, 0.01)';
            m.style.borderColor = '';
          }
        }, 800);
      }
    }, 500);

    if (reducedMotion) {
      container.style.display = 'none';
      return () => {
        if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      };
    }

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [reducedMotion]);

  // Scroll-driven transition: parallax, opacity, then hide
  useEffect(() => {
    if (reducedMotion) return;

    const unsub = subscribe((progress: number) => {
      const container = containerRef.current;
      if (!container) return;

      // Opacity: 0.25 steady → decreasing → hidden
      let opacity: number;
      if (progress < 0.30) {
        opacity = 0.25;
      } else if (progress < 0.50) {
        // Slight parallax intensification
        opacity = 0.25;
      } else if (progress < 0.60) {
        opacity = 0.25 - (progress - 0.50) / 0.10 * 0.15; // 0.25 → 0.10
      } else if (progress < 0.70) {
        opacity = 0.10 - (progress - 0.60) / 0.10 * 0.10; // 0.10 → 0.0
      } else {
        opacity = 0;
      }

      container.style.opacity = `${opacity}`;

      // Performance: hide DOM when invisible
      if (progress >= 0.70) {
        container.style.display = 'none';
        // Stop pulsing
        if (pulseIntervalRef.current) {
          clearInterval(pulseIntervalRef.current);
          pulseIntervalRef.current = null;
        }
      } else {
        container.style.display = '';
      }
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  // Mouse parallax
  useEffect(() => {
    if (reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const handleMouse = (e: MouseEvent) => {
      const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
      container.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouse);
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={styles.hudGridContainer}
      style={{ opacity: 0.25 }}
    />
  );
}
