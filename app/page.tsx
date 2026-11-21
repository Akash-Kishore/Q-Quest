'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleEnter = () => {
    setIsExiting(true);
    setTimeout(() => {
      router.push('/loading');
    }, 800);
  };

  useEffect(() => {
    const starLayer = document.getElementById('parallax-star');
    const gridLayer = document.getElementById('parallax-grid');
    const coordsDisplay = document.getElementById('coords-display');

    // High-friction parallax logic. The loop sleeps once it reaches its target
    // and wakes on pointer input instead of consuming a frame forever.
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const friction = 0.05;
    let animationId = 0;
    let previousTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return;
        targetX = (e.clientX - window.innerWidth / 2) * -0.05;
        targetY = (e.clientY - window.innerHeight / 2) * -0.05;
        if (animationId === 0 && !document.hidden) {
          previousTime = performance.now();
          animationId = requestAnimationFrame(animate);
        }
    };

    document.addEventListener('pointermove', handlePointerMove, { passive: true });

    function animate(time: number) {
        animationId = 0;
        if (document.hidden) return;
        const deltaScale = Math.min(3, Math.max(0.5, (time - previousTime) / (1000 / 60)));
        previousTime = time;
        const frameFriction = 1 - Math.pow(1 - friction, deltaScale);

        // Smooth inertia calculation
        currentX += (targetX - currentX) * frameFriction;
        currentY += (targetY - currentY) * frameFriction;

        if (starLayer) {
            starLayer.style.transform = `translate(${currentX * 1.5}px, ${currentY * 1.5}px)`;
        }
        if (gridLayer) {
            gridLayer.style.transform = `translate(${currentX * 0.8}px, ${currentY * 0.8}px)`;
        }
        const remainingX = Math.abs(targetX - currentX);
        const remainingY = Math.abs(targetY - currentY);
        if (remainingX > 0.01 || remainingY > 0.01) {
          animationId = requestAnimationFrame(animate);
        }
    }

    // Shifting coordinates logic
    let timeoutId: ReturnType<typeof setTimeout>;
    function updateCoords() {
        const baseLat = 40.7128;
        const baseLon = 74.0060;
        const drift = () => (Math.random() - 0.5) * 0.005;
        const lat = (baseLat + drift()).toFixed(4);
        const lon = (baseLon + drift()).toFixed(4);
        if (coordsDisplay) coordsDisplay.textContent = `[${lat}° N, ${lon}° W]`;
        timeoutId = setTimeout(updateCoords, 100 + Math.random() * 200);
    }
    updateCoords();

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
        animationId = 0;
        clearTimeout(timeoutId);
        return;
      }
      updateCoords();
      if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
        previousTime = performance.now();
        animationId = requestAnimationFrame(animate);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        :root {
            --ratio: 1.618;
            --base-size: 16px;
            --size-xs: calc(var(--base-size) / (var(--ratio) * var(--ratio)));
            --size-sm: calc(var(--base-size) / var(--ratio));
            --size-md: var(--base-size);
            --size-lg: calc(var(--base-size) * var(--ratio));
            --size-xl: calc(var(--base-size) * var(--ratio) * var(--ratio));
            --size-2xl: calc(var(--base-size) * var(--ratio) * var(--ratio) * var(--ratio));
            
            --hub-size: clamp(140px, 34vw, 320px);
            --orbit-size: clamp(240px, 68vw, 640px);
        }

        html,
        body {
            background-color: #000000;
            overflow: hidden;
            font-family: 'Satoshi', sans-serif;
            width: 100vw;
            height: 100vh;
            max-width: 100%;
            overscroll-behavior: none;
        }

        .parallax-layer {
            position: fixed;
            top: -10%;
            left: -10%;
            width: 120%;
            height: 120%;
            pointer-events: none;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .starfield {
            z-index: 0;
            background-image: 
                radial-gradient(1.5px 1.5px at 10% 10%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 25% 15%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 40% 12%, rgba(255,255,255,0.7), rgba(0,0,0,0)),
                radial-gradient(2px 2px at 60% 8%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(3px 3px at 80% 15%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 95% 5%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 12% 35%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 30% 45%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 45% 30%, rgba(255,255,255,0.5), rgba(0,0,0,0)),
                radial-gradient(4px 4px at 65% 35%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 85% 42%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 5% 65%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(3.5px 3.5px at 22% 75%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 38% 60%, rgba(255,255,255,0.8), rgba(0,0,0,0)),
                radial-gradient(2.5px 2.5px at 55% 85%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 75% 70%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(3px 3px at 92% 80%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1.5px 1.5px at 15% 90%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2.5px 2.5px at 48% 95%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(2px 2px at 70% 92%, #FFFFFF, rgba(0,0,0,0)),
                radial-gradient(1px 1px at 88% 98%, rgba(255,255,255,0.6), rgba(0,0,0,0));
            background-size: 100% 100%;
        }

        .background-grid {
            z-index: 1;
            background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
            background-size: 60px 60px;
        }

        .scene {
            perspective: 1500px;
            width: var(--orbit-size);
            height: var(--orbit-size);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }

        .orbital-wrapper {
            position: absolute;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transform: rotateX(65deg) rotateY(-10deg) rotateZ(35deg);
            transform-origin: 50.1% 50.1%;
        }

        .orbital-text-container {
            position: absolute;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            animation: orbital-rotate 20s linear infinite;
            transform-origin: 50.1% 50.1%;
        }

        @keyframes orbital-rotate {
            from { transform: rotateZ(0deg); }
            to { transform: rotateZ(-360deg); }
        }

        .orbital-text-svg {
            position: absolute;
            width: 100%;
            height: 100%;
            overflow: visible;
        }

        .hub-trigger {
            z-index: 25;
            position: relative;
            background-color: white;
            width: var(--hub-size);
            height: var(--hub-size);
            border-radius: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 100px rgba(255, 255, 255, 0.1);
            cursor: pointer;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 0;
            padding: 0;
            -webkit-tap-highlight-color: transparent;
        }
        
        .hub-trigger:hover {
            transform: scale(1.02);
        }

        .enter-label {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: -0.055em;
            -webkit-text-stroke: 0.35px currentColor;
            text-shadow: 0 0 0 currentColor;
        }


        .scrolling-text {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.4em;
            fill: white;
            font-size: 10px;
        }

        .hero-title {
            font-family: 'Cabinet Grotesk', sans-serif;
            font-weight: 900;
            letter-spacing: -0.05em;
            font-size: var(--size-md);
        }

        .technical-overlay {
            font-family: 'JetBrains Mono', monospace;
            font-size: 10pt;
            color: rgba(255, 255, 255, 0.6);
            pointer-events: none;
            z-index: 40;
        }

        @media (max-width: 640px) {
            :root {
                --hub-size: clamp(132px, 38vw, 160px);
                --orbit-size: min(68vw, 260px);
            }

            .technical-overlay {
                font-size: 0.625rem;
            }

            .hub-trigger span {
                opacity: 1;
                font-size: 1rem;
            }

            .scrolling-text {
                font-size: 8px;
                letter-spacing: 0.25em;
            }
        }

        .landing-header {
            position: fixed;
            inset: 0 0 auto;
            z-index: 50;
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.75rem;
            padding-top: max(1rem, env(safe-area-inset-top));
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
            color: white;
            pointer-events: none;
        }

        .corner-label {
            position: relative;
            width: min(42vw, 24rem);
            height: clamp(4.5rem, 7vw, 7rem);
            box-sizing: border-box;
            border-top: 1px solid rgba(255, 255, 255, 0.3);
            display: flex;
            align-items: flex-start;
            padding-top: clamp(0.55rem, 1vw, 0.9rem);
            color: inherit;
            text-decoration: none;
            pointer-events: auto;
        }

        .corner-label::after {
            content: '';
            position: absolute;
            top: 0;
            width: 1px;
            height: 100%;
            background: rgba(255, 255, 255, 0.3);
        }

        .corner-label-left {
            border-left: 1px solid rgba(255, 255, 255, 0.3);
            padding-left: clamp(0.65rem, 1vw, 1rem);
        }

        .corner-label-left::after {
            left: 0;
        }

        .corner-label-right {
            border-right: 1px solid rgba(255, 255, 255, 0.3);
            justify-content: flex-end;
            padding-right: clamp(0.65rem, 1vw, 1rem);
            text-align: right;
        }

        .corner-label-right::after {
            right: 0;
        }

        @media (min-width: 640px) {
            .landing-header {
                padding-top: max(2.5rem, env(safe-area-inset-top));
                padding-left: max(2.5rem, env(safe-area-inset-left));
                padding-right: max(2.5rem, env(safe-area-inset-right));
            }
        }

        @media (max-width: 480px) {
            .corner-label-right .technical-overlay {
                font-size: 0.4rem;
                letter-spacing: 0.045em;
            }
        }

        .landing-corner {
            position: fixed;
            bottom: max(1rem, env(safe-area-inset-bottom));
            z-index: 20;
            width: clamp(3.5rem, 8vw, 6rem);
            height: clamp(3.5rem, 8vw, 6rem);
            pointer-events: none;
            opacity: 0.3;
        }

        .landing-corner-left {
            left: max(1rem, env(safe-area-inset-left));
            border-bottom: 1px solid white;
            border-left: 1px solid white;
        }

        .landing-corner-right {
            right: max(1rem, env(safe-area-inset-right));
            border-bottom: 1px solid white;
            border-right: 1px solid white;
        }

        .landing-footer {
            padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }

        @media (hover: none) {
            .hub-trigger span { opacity: 1; }
            .hub-trigger:active { transform: scale(0.97); }
        }

        @media (prefers-reduced-motion: reduce) {
            .orbital-text-container { animation: none; }
            .parallax-layer,
            .hub-trigger { transition: none; }
        }
      `}} />
      <div 
        className="font-body text-on-surface select-none"
        style={{
          transition: 'opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          opacity: isExiting ? 0 : 1,
          pointerEvents: isExiting ? 'none' : 'auto'
        }}
      >
        {/* Parallax Background Elements */}
        <div className="parallax-layer starfield" id="parallax-star"></div>
        <div className="parallax-layer background-grid" id="parallax-grid"></div>
        
        {/* Technical Metadata Overlays */}
        <header className="landing-header font-body tracking-widest uppercase">
          <Link href="/home" className="corner-label corner-label-left" aria-label="Go to Q-Quest home">
            <div className="hero-title text-white">Q_QUEST</div>
          </Link>
          <div className="corner-label corner-label-right">
            <div className="technical-overlay uppercase whitespace-nowrap">2026 // Q_QUEST // Systems_Ready</div>
          </div>
        </header>
        
        <div className="fixed bottom-0 left-0 z-50 technical-overlay hidden sm:block p-10 lg:p-14">
          <div id="coords-display">[40.7128° N, 74.0060° W]</div>
        </div>
        
        <div className="landing-footer fixed bottom-0 left-1/2 -translate-x-1/2 z-50 technical-overlay tracking-[0.2em] whitespace-nowrap p-6 sm:p-10 lg:p-14">
            CALIBRATING SYSTEMS...
        </div>
        
        {/* Main Content: Central Hub with 3D Orbit */}
        <main className="relative z-10 w-full h-[100dvh] min-h-[100dvh] flex items-center justify-center">
          <div className="scene">
            <div className="orbital-wrapper">
              <div className="orbital-text-container">
                <svg className="orbital-text-svg" viewBox="0 0 200 200">
                  <defs>
                    <path d="M 5, 100 a 95,95 0 1,1 190,0 a 95,95 0 1,1 -190,0" id="orbitPath" fill="none" stroke="none"></path>
                  </defs>
                  <text className="scrolling-text">
                    <textPath href="#orbitPath" startOffset="0%">
                      LET&apos;S ROCK! ★ LET&apos;S ROCK! ★ LET&apos;S ROCK! ★ LET&apos;S ROCK! ★ LET&apos;S ROCK! ★ LET&apos;S ROCK!
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
            <button
              type="button"
              aria-label="Enter Q-Quest"
              className="hub-trigger group"
              onClick={handleEnter}
            >
              <div className="absolute inset-0 border-4 border-white/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <span className="enter-label opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-black text-center text-[calc(var(--size-lg)_+_4px)] leading-none">ENTER<br/>The Void</span>
            </button>
          </div>
        </main>
        
        {/* Decorative Corner Elements */}
        <div className="landing-corner landing-corner-left" />
        <div className="landing-corner landing-corner-right" />
      </div>
    </>
  );
}
