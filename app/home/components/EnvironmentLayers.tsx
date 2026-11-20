'use client';

import { useRef, useEffect } from 'react';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Interpolation helpers
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

/** Maps progress within [start, end] to 0–1 */
function rangeProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

// ---------------------------------------------------------------------------
// Color interpolation for atmospheric transition
// ---------------------------------------------------------------------------
interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function rgbToString(c: RGB, alpha: number = 1): string {
  return `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${alpha})`;
}

function lerpRgb(a: RGB, b: RGB, t: number): RGB {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
  };
}

// Dark space → atmospheric evolution → dark aurora. The launchpad remains in
// the same violet/magenta world as the opening Q-Quest scene so the pixel
// reconstruction feels like one continuous environment, not a theme swap.
// Each stop is a progress threshold and corresponding base color
const ATMOSPHERE_STOPS: { p: number; color: RGB }[] = [
  { p: 0.00, color: hexToRgb('#050005') },
  { p: 0.55, color: hexToRgb('#050005') },
  { p: 0.68, color: hexToRgb('#050005') }, // held dark through pixel transition start
  { p: 0.80, color: hexToRgb('#0a0010') }, // barely perceptible — pixel curtain active
  { p: 0.88, color: hexToRgb('#170322') }, // reconstructed spheres remain in the void
  { p: 0.92, color: hexToRgb('#220632') },
  { p: 0.96, color: hexToRgb('#12001d') }, // launchpad resolves into a dark aurora
];

function getAtmosphereColor(progress: number): RGB {
  if (progress <= ATMOSPHERE_STOPS[0].p) return ATMOSPHERE_STOPS[0].color;
  for (let i = 1; i < ATMOSPHERE_STOPS.length; i++) {
    if (progress <= ATMOSPHERE_STOPS[i].p) {
      const t = rangeProgress(progress, ATMOSPHERE_STOPS[i - 1].p, ATMOSPHERE_STOPS[i].p);
      return lerpRgb(ATMOSPHERE_STOPS[i - 1].color, ATMOSPHERE_STOPS[i].color, t);
    }
  }
  return ATMOSPHERE_STOPS[ATMOSPHERE_STOPS.length - 1].color;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function EnvironmentLayers() {
  const { subscribe, reducedMotion } = useHomeScroll();

  const voidRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const nebulaRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      // Show the final dark-aurora state without animated movement.
      if (voidRef.current) voidRef.current.style.display = 'none';
      if (starsRef.current) starsRef.current.style.opacity = '0';
      if (nebulaRef.current) nebulaRef.current.style.opacity = '0';
      if (vignetteRef.current) vignetteRef.current.style.opacity = '0';
      if (auroraRef.current) auroraRef.current.style.opacity = '1';
      if (grainRef.current) grainRef.current.style.opacity = '0.06';
      return;
    }

    const unsub = subscribe((progress: number) => {
      // ---- Space void base color ----
      if (voidRef.current) {
        const baseColor = getAtmosphereColor(progress);
        // The zoom resolves into a genuinely dark block curtain. The earlier
        // nebula illumination recedes before the screen begins fracturing.
        const radialIntensity = progress < 0.55
          ? 0.35
          : progress < 0.64
            ? lerp(0.35, 0.035, rangeProgress(progress, 0.55, 0.64))
            : progress < 0.90
              ? 0.035
              : lerp(0.035, 0.10, rangeProgress(progress, 0.90, 0.96));

        const purpleRadial = `rgba(160, 32, 240, ${radialIntensity})`;
        const pinkRadial = `rgba(255, 20, 147, ${radialIntensity * 0.8})`;

        voidRef.current.style.background = `
          radial-gradient(circle at 20% 30%, ${purpleRadial} 0%, transparent 60%),
          radial-gradient(circle at 80% 70%, ${pinkRadial} 0%, transparent 60%),
          ${rgbToString(baseColor)}
        `;
      }

      // ---- Star field ----
      if (starsRef.current) {
        // Visible until sphere dominates, then dim
        const starOpacity = progress < 0.30
          ? 0.4
          : progress < 0.65
            ? lerp(0.4, 0.0, rangeProgress(progress, 0.30, 0.65))
            : 0;
        starsRef.current.style.opacity = `${starOpacity}`;
      }

      // ---- Nebula ----
      if (nebulaRef.current) {
        // Brightens during hold, then dissolves during emergence
        let nebulaOpacity: number;
        if (progress < 0.50) {
          nebulaOpacity = 1.0;
        } else if (progress < 0.65) {
          // Intensify
          nebulaOpacity = lerp(1.0, 1.3, rangeProgress(progress, 0.50, 0.65));
        } else if (progress < 0.85) {
          nebulaOpacity = lerp(1.3, 0.0, rangeProgress(progress, 0.65, 0.85));
        } else {
          nebulaOpacity = 0;
        }
        nebulaRef.current.style.opacity = `${Math.min(nebulaOpacity, 1.0)}`;
        // Scale up for intensification effect
        if (progress > 0.50 && progress < 0.70) {
          const s = lerp(1.0, 1.15, rangeProgress(progress, 0.50, 0.70));
          nebulaRef.current.style.transform = `scale(${s})`;
        }
      }

      // ---- Vignette ----
      if (vignetteRef.current) {
        const vigOpacity = progress < 0.55
          ? 1.0
          : lerp(1.0, 0.0, rangeProgress(progress, 0.55, 0.80));
        vignetteRef.current.style.opacity = `${vigOpacity}`;
      }

      // ---- Dark aurora gradient ----
      if (auroraRef.current) {
        const auroraOpacity = progress < 0.90
          ? 0
          : rangeProgress(progress, 0.90, 0.985);
        auroraRef.current.style.opacity = `${auroraOpacity}`;
      }

      // ---- Paper grain ----
      if (grainRef.current) {
        const grainOpacity = progress < 0.94
          ? 0
          : lerp(0, 0.06, rangeProgress(progress, 0.94, 0.99));
        grainRef.current.style.opacity = `${grainOpacity}`;
      }
    });

    return unsub;
  }, [subscribe, reducedMotion]);

  return (
    <>
      <div ref={voidRef} className={styles.spaceVoid}
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(160, 32, 240, 0.35) 0%, transparent 60%),
            radial-gradient(circle at 80% 70%, rgba(255, 20, 147, 0.35) 0%, transparent 60%),
            #050005
          `,
        }}
      />
      <div ref={starsRef} className={styles.starField} style={{ opacity: 0.4 }} />
      <div ref={nebulaRef} className={styles.nebula}
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(160, 32, 240, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse at 30% 20%, rgba(255, 20, 147, 0.25) 0%, transparent 50%)
          `,
        }}
      />
      <div ref={vignetteRef} className={styles.vignette} />
      <div ref={auroraRef} className={styles.auroraLayer} style={{ opacity: 0 }} />
      <div ref={grainRef} className={styles.paperGrain} style={{ opacity: 0 }} />
    </>
  );
}
