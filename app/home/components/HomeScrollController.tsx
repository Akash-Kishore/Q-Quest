'use client';

import {
  useRef,
  useEffect,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import styles from '../home.module.css';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Context — exposes scroll progress to children without re-renders
// ---------------------------------------------------------------------------
type ScrollSubscriber = (progress: number) => void;

interface HomeScrollContextValue {
  subscribe: (fn: ScrollSubscriber) => () => void;
  reducedMotion: boolean;
}

const HomeScrollContext = createContext<HomeScrollContextValue | null>(null);

export function useHomeScroll(): HomeScrollContextValue {
  const ctx = useContext(HomeScrollContext);
  if (!ctx) throw new Error('useHomeScroll must be used within <HomeScrollController>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
interface HomeScrollControllerProps {
  children: ReactNode;
}

export default function HomeScrollController({ children }: HomeScrollControllerProps) {
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const subscribersRef = useRef<Set<ScrollSubscriber>>(new Set());
  const lenisRef = useRef<Lenis | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
  }, []);

  const subscribe = useCallback((fn: ScrollSubscriber) => {
    subscribersRef.current.add(fn);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion.current) {
      // Push progress = 1 so everything renders in final state
      subscribersRef.current.forEach((fn) => fn(1));
      return;
    }

    const track = scrollTrackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;

    // --- Lenis smooth scroll ---
    const lenis = new Lenis({
      wrapper: window as unknown as HTMLElement,
      duration: 1.4,
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

    // --- ScrollTrigger: pin the cinematic stage ---
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
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
  }, []);

  const contextValue: HomeScrollContextValue = {
    subscribe,
    reducedMotion: reducedMotion.current,
  };

  return (
    <HomeScrollContext.Provider value={contextValue}>
      <div ref={scrollTrackRef} className={styles.scrollTrack}>
        <div ref={stageRef} className={styles.cinematicStage}>
          {children}
        </div>
      </div>
    </HomeScrollContext.Provider>
  );
}
