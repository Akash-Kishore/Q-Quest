'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useSyncExternalStore,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Context — exposes scroll progress to children without re‑renders
// ---------------------------------------------------------------------------
type ScrollSubscriber = (progress: number) => void;

interface ScrollContextValue {
  /** Register a callback that fires on every scroll-progress update */
  subscribe: (fn: ScrollSubscriber) => () => void;
  /** Ref to the pinned viewport element (needed by GSAP ScrollTrigger) */
  triggerRef: React.RefObject<HTMLDivElement | null>;
  /** Whether reduced-motion is active */
  reducedMotion: boolean;
}

const ScrollContext = createContext<ScrollContextValue | null>(null);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

export function useScrollContext(): ScrollContextValue {
  const ctx = useContext(ScrollContext);
  if (!ctx) throw new Error('useScrollContext must be used within <ScrollController>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface ScrollControllerProps {
  children: ReactNode;
}

export default function ScrollController({ children }: ScrollControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const subscribersRef = useRef<Set<ScrollSubscriber>>(new Set());
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  // Subscribe helper — stable across renders
  const subscribe = useCallback((fn: ScrollSubscriber) => {
    subscribersRef.current.add(fn);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  // Setup Lenis + GSAP
  useEffect(() => {
    if (reducedMotion) {
      // Immediately push progress = 1 so everything renders in final state
      subscribersRef.current.forEach((fn) => fn(1));
      return;
    }

    const container = containerRef.current;
    const trigger = triggerRef.current;
    if (!container || !trigger) return;

    // --- Lenis smooth scroll ---
    const lenis = new Lenis({
      wrapper: window as unknown as HTMLElement,
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP's ticker
    lenis.on('scroll', ScrollTrigger.update);
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // --- ScrollTrigger ---
    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      pin: trigger,
      scrub: 1,
      onUpdate: (self) => {
        const p = self.progress;
        subscribersRef.current.forEach((fn) => fn(p));
      },
    });

    return () => {
      st.kill();
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tickerCallback);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [reducedMotion]);

  const contextValue: ScrollContextValue = {
    subscribe,
    triggerRef,
    reducedMotion,
  };

  return (
    <ScrollContext.Provider value={contextValue}>
      <div ref={containerRef} style={{ height: '300vh', position: 'relative' }}>
        <div ref={triggerRef} style={{ height: '100vh', width: '100%' }}>
          {children}
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
