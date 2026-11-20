'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AtomLogo from '@/components/AtomLogo';
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

type LaunchCardKey = 'circuit' | 'research';

const LAUNCH_CARDS = {
  circuit: {
    title: 'Circuit Playground',
    role: 'Quantum Builder',
    code: 'EXPERIMENTAL-014',
    rank: '01',
    route: '/sandbox/circuit',
    image: '/images/launchpad/circuit-playground-sketch.png',
    description: 'Build circuits gate by gate, watch every state-vector transformation, and inspect the matrices behind the quantum action. This is the hands-on laboratory for fearless experiments.',
    stats: [
      ['Qubits', '05'],
      ['Gate set', '20+'],
      ['Matrices', 'LIVE'],
      ['Difficulty', 'ADAPTIVE'],
    ],
  },
  research: {
    title: 'Quantum Resources',
    role: 'Knowledge Library',
    code: 'ARCHIVE-LOG',
    rank: '02',
    route: '/sandbox/research',
    image: '/images/launchpad/research-vault-sketch.png',
    description: 'Enter a curated field archive of quantum ideas, practical explainers, and Beyond the Bit dispatches. Follow a concept from first intuition to a research-ready understanding.',
    stats: [
      ['Archive', 'LIVE'],
      ['Topics', 'CURATED'],
      ['Reading', 'FOCUSED'],
      ['Updates', 'FRESH'],
    ],
  },
} as const;

// ---------------------------------------------------------------------------
// SelectionReveal — Launch Pad emerges behind the dissolving pixel field.
// Cinematic oversized title settles to a responsive heading (never clips),
// then label / subtitle / cards reveal in sequence. No premature cards.
// ---------------------------------------------------------------------------
export default function SelectionReveal() {
  const { subscribe, reducedMotion, setScrollLocked } = useHomeScroll();
  const router = useRouter();
  const [selectedCard, setSelectedCard] = useState<LaunchCardKey | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [launching, setLaunching] = useState<LaunchCardKey | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const launchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const layerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const card1WrapRef = useRef<HTMLDivElement>(null);
  const card2WrapRef = useRef<HTMLDivElement>(null);
  const cardPointerFrameRef = useRef<number | null>(null);
  const interactiveRef = useRef(false);

  // Max cinematic scale for the title, measured from actual text bounds vs the
  // safe viewport region so the oversized initial state can never clip.
  const titleMaxScale = useRef(1);

  const resetCardMotion = useCallback((card: HTMLButtonElement | null) => {
    if (cardPointerFrameRef.current !== null) {
      cancelAnimationFrame(cardPointerFrameRef.current);
      cardPointerFrameRef.current = null;
    }
    if (!card) return;
    card.style.setProperty('--card-rotate-x', '0deg');
    card.style.setProperty('--card-rotate-y', '0deg');
    card.style.setProperty('--card-shift-x', '0px');
    card.style.setProperty('--card-shift-y', '0px');
    card.style.setProperty('--card-image-x', '0px');
    card.style.setProperty('--card-image-y', '0px');
    card.style.setProperty('--card-glow-x', '50%');
    card.style.setProperty('--card-glow-y', '50%');
    card.removeAttribute('data-pointer-active');
  }, []);

  const handleCardPointerMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const card = event.currentTarget;
    if (
      selectedCard
      || reducedMotion
      || event.pointerType === 'touch'
      || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      resetCardMotion(card);
      return;
    }

    const clientX = event.clientX;
    const clientY = event.clientY;
    if (cardPointerFrameRef.current !== null) {
      cancelAnimationFrame(cardPointerFrameRef.current);
    }
    cardPointerFrameRef.current = requestAnimationFrame(() => {
      cardPointerFrameRef.current = null;
      const bounds = card.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
      const horizontal = (x - 0.5) * 2;
      const vertical = (y - 0.5) * 2;

      card.style.setProperty('--card-rotate-x', `${(-vertical * 4).toFixed(2)}deg`);
      card.style.setProperty('--card-rotate-y', `${(horizontal * 5).toFixed(2)}deg`);
      card.style.setProperty('--card-shift-x', `${(horizontal * 3).toFixed(2)}px`);
      card.style.setProperty('--card-shift-y', `${(vertical * 3).toFixed(2)}px`);
      card.style.setProperty('--card-image-x', `${(-horizontal * 6).toFixed(2)}px`);
      card.style.setProperty('--card-image-y', `${(-vertical * 6).toFixed(2)}px`);
      card.style.setProperty('--card-glow-x', `${(x * 100).toFixed(1)}%`);
      card.style.setProperty('--card-glow-y', `${(y * 100).toFixed(1)}%`);
      card.setAttribute('data-pointer-active', 'true');
    });
  }, [reducedMotion, resetCardMotion, selectedCard]);

  const openDetails = useCallback((card: LaunchCardKey) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setIsClosing(false);
    setSelectedCard(card);
  }, []);

  const closeDetails = useCallback(() => {
    if (closeTimerRef.current) return;
    if (reducedMotion) {
      setSelectedCard(null);
      return;
    }
    setIsClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setSelectedCard(null);
      setIsClosing(false);
    }, 580);
  }, [reducedMotion]);

  const launchDestination = useCallback((destination: LaunchCardKey) => {
    if (launchTimerRef.current) return;
    setLaunching(destination);
    setScrollLocked(true);
    launchTimerRef.current = setTimeout(() => {
      router.push(LAUNCH_CARDS[destination].route);
    }, reducedMotion ? 160 : 1150);
  }, [reducedMotion, router, setScrollLocked]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (launchTimerRef.current) clearTimeout(launchTimerRef.current);
    if (cardPointerFrameRef.current !== null) {
      cancelAnimationFrame(cardPointerFrameRef.current);
    }
  }, []);

  useEffect(() => {
    if (!selectedCard) return;
    [card1WrapRef.current, card2WrapRef.current].forEach((wrapper) => {
      resetCardMotion(wrapper?.querySelector('button') ?? null);
    });
  }, [resetCardMotion, selectedCard]);

  useEffect(() => {
    router.prefetch(LAUNCH_CARDS.circuit.route);
    router.prefetch(LAUNCH_CARDS.research.route);
  }, [router]);

  useEffect(() => {
    if (!selectedCard) return;
    const html = document.documentElement;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const lockedScrollY = window.scrollY;
    const holdTimelinePosition = () => {
      if (Math.abs(window.scrollY - lockedScrollY) > 1) {
        window.scrollTo({ top: lockedScrollY, behavior: 'instant' });
      }
    };
    window.addEventListener('scroll', holdTimelinePosition, { passive: true });
    setScrollLocked(true);
    html.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDetails();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusFrame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', holdTimelinePosition);
      html.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      setScrollLocked(false);
      previouslyFocused?.focus();
    };
  }, [closeDetails, selectedCard, setScrollLocked]);

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
      // Reveal the light-world interface only after the dark screen has
      // broken into pixels and rebuilt into the sphere shells.
      if (layerRef.current) {
        layerRef.current.style.visibility = g > 0.912 ? 'visible' : 'hidden';
      }

      // --- Title: oversized cinematic settle after reconstruction, 0.915–0.948 ---
      if (titleRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.915, 0.948));
        const scale = lerp(titleMaxScale.current, 1, t);
        const y = lerp(34, 0, t);
        titleRef.current.style.transform = `translateY(${y}px) scale(${scale})`;
        titleRef.current.style.opacity = String(Math.min(1, t * 1.4));
      }

      // --- System label: 0.938–0.965 ---
      if (labelRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.938, 0.965));
        labelRef.current.style.transform = `translateY(${lerp(28, 0, t)}px)`;
        labelRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
      }

      // --- Subtitle: 0.948–0.975 ---
      if (subtitleRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.948, 0.975));
        subtitleRef.current.style.transform = `translateY(${lerp(24, 0, t)}px)`;
        subtitleRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
      }

      // --- Card 1: 0.962–0.99 ---
      if (card1WrapRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.962, 0.99));
        card1WrapRef.current.style.transform = `translateY(${lerp(50, 0, t)}px)`;
        card1WrapRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
        card1WrapRef.current.style.pointerEvents = t > 0.8 ? 'auto' : 'none';
      }

      // --- Card 2: 0.968–0.997 ---
      if (card2WrapRef.current) {
        const t = easeOutCubic(rangeProgress(g, 0.968, 0.997));
        card2WrapRef.current.style.transform = `translateY(${lerp(50, 0, t)}px)`;
        card2WrapRef.current.style.clipPath = `inset(0 0 ${lerp(100, 0, t)}% 0)`;
        card2WrapRef.current.style.pointerEvents = t > 0.8 ? 'auto' : 'none';
      }

      // Enable layer interaction once settled
      if (layerRef.current) {
        const shouldBeInteractive = g > 0.985;
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

  const selectedDetails = selectedCard ? LAUNCH_CARDS[selectedCard] : null;

  return (
    <div
      ref={layerRef}
      className={styles.selectionLayer}
      data-modal-open={selectedCard ? 'true' : undefined}
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
            <button
              type="button"
              onClick={(event) => {
                resetCardMotion(event.currentTarget);
                openDetails('circuit');
              }}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={(event) => resetCardMotion(event.currentTarget)}
              onPointerCancel={(event) => resetCardMotion(event.currentTarget)}
              onBlur={(event) => resetCardMotion(event.currentTarget)}
              className={`${styles.card} appearance-none border-0 p-0 text-left`}
              aria-haspopup="dialog"
            >
              <span className={styles.cardRank} aria-hidden="true">01</span>
              <div className={styles.cardImageWrap}>
                <Image
                  alt="Circuit Playground"
                  className={styles.cardImage}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 90vw, 400px"
                  src={LAUNCH_CARDS.circuit.image}
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
            </button>
          </div>

          {/* Card 2: Quantum Resources */}
          <div
            ref={card2WrapRef}
            className={styles.cardPerspective}
            style={{ clipPath: 'inset(0 0 100% 0)', pointerEvents: 'none' }}
          >
            <button
              type="button"
              onClick={(event) => {
                resetCardMotion(event.currentTarget);
                openDetails('research');
              }}
              onPointerMove={handleCardPointerMove}
              onPointerLeave={(event) => resetCardMotion(event.currentTarget)}
              onPointerCancel={(event) => resetCardMotion(event.currentTarget)}
              onBlur={(event) => resetCardMotion(event.currentTarget)}
              className={`${styles.card} appearance-none border-0 p-0 text-left`}
              aria-haspopup="dialog"
            >
              <span className={styles.cardRank} aria-hidden="true">02</span>
              <div className={styles.cardImageWrap}>
                <Image
                  alt="Quantum Resources"
                  className={styles.cardImage}
                  fill
                  sizes="(max-width: 768px) 90vw, 400px"
                  src={LAUNCH_CARDS.research.image}
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
                <h3 className={styles.cardTitle}>Quantum Resources</h3>
              </div>
            </button>
          </div>
        </div>
      </div>

      {selectedDetails && (
        <dialog
          open
          className={styles.detailOverlay}
          data-closing={isClosing ? 'true' : undefined}
          aria-modal="true"
          aria-labelledby="launch-detail-title"
        >
          <button
            ref={closeButtonRef}
            type="button"
            className={styles.detailClose}
            onClick={closeDetails}
            disabled={isClosing}
            aria-label="Close mission details"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <div className={styles.detailStage}>
            <article className={styles.detailArtCard}>
              <span className={styles.detailRank}>{selectedDetails.rank}</span>
              <div className={styles.detailArtImage}>
                <Image
                  src={selectedDetails.image}
                  alt={`${selectedDetails.title} illustrated mission art`}
                  fill
                  sizes="(max-width: 760px) 82vw, 42vw"
                />
              </div>
              <div className={styles.detailArtFooter}>
                <span>{selectedDetails.code}</span>
                <strong>{selectedDetails.title}</strong>
                <small>{selectedDetails.role}</small>
              </div>
            </article>

            <article
              className={styles.detailInfoCard}
            >
              <div className={styles.detailInfoIntro}>
                <span className={styles.detailEyebrow}>Mission dossier // {selectedDetails.rank}</span>
                <h3 id="launch-detail-title">{selectedDetails.title}</h3>
                <p className={styles.detailRole}>{selectedDetails.role}</p>
                <p className={styles.detailDescription}>{selectedDetails.description}</p>
              </div>

              <dl className={styles.detailStats}>
                {selectedDetails.stats.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <button
                type="button"
                className={styles.detailLaunchButton}
                onClick={() => selectedCard && launchDestination(selectedCard)}
                disabled={Boolean(launching)}
              >
                Let&apos;s go
                <span aria-hidden="true">↗</span>
              </button>
            </article>
          </div>
        </dialog>
      )}

      {launching && createPortal((
        <output className={styles.routeTransition} aria-live="assertive">
          <div className={styles.routeTransitionGrid} aria-hidden="true" />
          <div className={styles.routeTransitionOrbit} aria-hidden="true">
            <AtomLogo />
            <span /><span /><span />
          </div>
          <div className={styles.routeTransitionCopy}>
            <span>Q-QUEST / TRANSFER SEQUENCE</span>
            <strong>{launching === 'circuit' ? 'Calibrating circuit playground' : 'Indexing resource archive'}</strong>
            <p>{launching === 'circuit' ? 'Preparing qubits, gates, state vectors, and live matrices.' : 'Synchronizing field notes, explainers, and research signals.'}</p>
          </div>
          <div className={styles.routeTransitionMeter} aria-hidden="true"><i /></div>
          <div className={styles.routeTransitionStatus}>
            <span>SECURE UPLINK</span><span>ROUTE LOCKED</span><b>( LOADING )</b>
          </div>
        </output>
      ), document.body)}
    </div>
  );
}
