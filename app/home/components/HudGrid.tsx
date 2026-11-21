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
  const pulseResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activePulseModuleRef = useRef<HTMLElement | null>(null);
  const progressRef = useRef(0);
  const pulseControllerRef = useRef<{ start: () => void; stop: () => void } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Generate grid modules
    const totalSlots = 12 * 8;
    const occupied = new Set<number>();
    const modules: HTMLElement[] = [];

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
      modules.push(mod);
    }

    const stopPulse = () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
      if (pulseResetRef.current) clearTimeout(pulseResetRef.current);
      if (activePulseModuleRef.current) {
        activePulseModuleRef.current.style.background = 'rgba(255, 255, 255, 0.01)';
        activePulseModuleRef.current.style.borderColor = '';
      }
      pulseIntervalRef.current = null;
      pulseResetRef.current = null;
      activePulseModuleRef.current = null;
    };

    const startPulse = () => {
      if (pulseIntervalRef.current || document.hidden || progressRef.current >= 0.70) return;
      pulseIntervalRef.current = setInterval(() => {
        const m = modules[Math.floor(Math.random() * modules.length)];
        if (!m) return;
        if (activePulseModuleRef.current && activePulseModuleRef.current !== m) {
          activePulseModuleRef.current.style.background = 'rgba(255, 255, 255, 0.01)';
          activePulseModuleRef.current.style.borderColor = '';
        }
        m.style.background = 'rgba(255, 255, 255, 0.05)';
        m.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        if (pulseResetRef.current) clearTimeout(pulseResetRef.current);
        activePulseModuleRef.current = m;
        pulseResetRef.current = setTimeout(() => {
          m.style.background = 'rgba(255, 255, 255, 0.01)';
          m.style.borderColor = '';
          pulseResetRef.current = null;
          activePulseModuleRef.current = null;
        }, 800);
      }, 500);
    };
    pulseControllerRef.current = { start: startPulse, stop: stopPulse };

    const handleVisibilityChange = () => {
      if (document.hidden) stopPulse();
      else startPulse();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPulse();

    if (reducedMotion) {
      container.style.display = 'none';
      return () => {
        stopPulse();
        pulseControllerRef.current = null;
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }

    return () => {
      stopPulse();
      pulseControllerRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reducedMotion]);

  // Scroll-driven transition: parallax, opacity, then hide
  useEffect(() => {
    if (reducedMotion) return;

    const unsub = subscribe((progress: number) => {
      progressRef.current = progress;
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
        pulseControllerRef.current?.stop();
      } else {
        container.style.display = '';
        pulseControllerRef.current?.start();
      }
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  // Mouse parallax
  useEffect(() => {
    if (reducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const applyPointer = () => {
      pointerFrame = 0;
      const moveX = (pointerX / window.innerWidth - 0.5) * 20;
      const moveY = (pointerY / window.innerHeight - 0.5) * 20;
      container.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };
    const handleMouse = (e: MouseEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(applyPointer);
    };

    window.addEventListener('mousemove', handleMouse, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouse);
      cancelAnimationFrame(pointerFrame);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={styles.hudGridContainer}
      style={{ opacity: 0.25 }}
    />
  );
}
