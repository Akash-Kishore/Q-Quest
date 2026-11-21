'use client';

import {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useSyncExternalStore,
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
  setScrollLocked: (locked: boolean) => void;
}

const HomeScrollContext = createContext<HomeScrollContextValue | null>(null);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const LAUNCH_PAD_HOLD_VIEWPORTS = 1;

function subscribeToReducedMotion(onChange: () => void) {
  const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

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
  const scrollLockedRef = useRef(false);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const subscribe = useCallback((fn: ScrollSubscriber) => {
    subscribersRef.current.add(fn);
    return () => {
      subscribersRef.current.delete(fn);
    };
  }, []);

  const setScrollLocked = useCallback((locked: boolean) => {
    scrollLockedRef.current = locked;
    if (locked || document.hidden) lenisRef.current?.stop();
    else lenisRef.current?.start();
  }, []);

  useEffect(() => {
    if (reducedMotion) {
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
    let tickerAttached = true;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop();
        if (tickerAttached) {
          gsap.ticker.remove(tickerCallback);
          tickerAttached = false;
        }
        return;
      }

      if (!tickerAttached) {
        gsap.ticker.add(tickerCallback);
        tickerAttached = true;
      }
      if (!scrollLockedRef.current) lenis.start();
      ScrollTrigger.refresh();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // --- ScrollTrigger: pin the cinematic stage ---
    const st = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      pin: stage,
      scrub: 1,
      onUpdate: (self) => {
        const totalScrollDistance = Math.max(1, self.end - self.start);
        const holdScrollDistance = window.innerHeight * LAUNCH_PAD_HOLD_VIEWPORTS;
        const animationScrollDistance = Math.max(
          1,
          totalScrollDistance - holdScrollDistance
        );
        const travelledDistance = self.progress * totalScrollDistance;
        const p = Math.min(1, travelledDistance / animationScrollDistance);
        subscribersRef.current.forEach((fn) => fn(p));
      },
    });

    return () => {
      st.kill();
      lenis.destroy();
      lenisRef.current = null;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (tickerAttached) gsap.ticker.remove(tickerCallback);
    };
  }, [reducedMotion]);

  const contextValue = useMemo<HomeScrollContextValue>(() => ({
    subscribe,
    reducedMotion,
    setScrollLocked,
  }), [subscribe, reducedMotion, setScrollLocked]);

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
