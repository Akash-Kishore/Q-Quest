'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const starLayer = document.getElementById('parallax-star');
    const gridLayer = document.getElementById('parallax-grid');
    const coordsDisplay = document.getElementById('coords-display');

    // High-friction parallax logic
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    const friction = 0.05;
    let animationId: number;

    const handleMouseMove = (e: MouseEvent) => {
        targetX = (e.clientX - window.innerWidth / 2) * -0.05;
        targetY = (e.clientY - window.innerHeight / 2) * -0.05;
    };

    document.addEventListener('mousemove', handleMouseMove);

    function animate() {
        // Smooth inertia calculation
        currentX += (targetX - currentX) * friction;
        currentY += (targetY - currentY) * friction;

        if (starLayer) {
            starLayer.style.transform = `translate(${currentX * 1.5}px, ${currentY * 1.5}px)`;
        }
        if (gridLayer) {
            gridLayer.style.transform = `translate(${currentX * 0.8}px, ${currentY * 0.8}px)`;
        }
        animationId = requestAnimationFrame(animate);
    }
    animate();

    // Shifting coordinates logic
    let timeoutId: NodeJS.Timeout;
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

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
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
            
            --hub-size: 320px;
            --orbit-size: 640px;
        }

        body {
            background-color: #000000;
            overflow: hidden;
            font-family: 'Satoshi', sans-serif;
            width: 100vw;
            height: 100vh;
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
        }
        
        .hub-trigger:hover {
            transform: scale(1.02);
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
      `}} />
      <div className="font-body text-on-surface select-none">
        {/* Parallax Background Elements */}
        <div className="parallax-layer starfield" id="parallax-star"></div>
        <div className="parallax-layer background-grid" id="parallax-grid"></div>
        
        {/* Technical Metadata Overlays */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center bg-transparent text-white font-body tracking-widest uppercase text-ratio-xs p-14">
          <div className="hero-title text-white">Q_QUEST</div>
          <div className="technical-overlay uppercase">2026 // Q_QUEST // Systems_Ready</div>
        </header>
        
        <div className="fixed bottom-0 left-0 z-50 technical-overlay p-14">
          <div id="coords-display">[40.7128° N, 74.0060° W]</div>
        </div>
        
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 technical-overlay tracking-[0.2em] p-14">
            CALIBRATING SYSTEMS...
        </div>
        
        {/* Main Content: Central Hub with 3D Orbit */}
        <main className="relative z-10 w-full h-screen flex items-center justify-center">
          <div className="scene">
            <div className="orbital-wrapper">
              <div className="orbital-text-container">
                <svg className="orbital-text-svg" viewBox="0 0 200 200">
                  <defs>
                    <path d="M 5, 100 a 95,95 0 1,1 190,0 a 95,95 0 1,1 -190,0" id="orbitPath" fill="none" stroke="none"></path>
                  </defs>
                  <text className="scrolling-text">
                    <textPath href="#orbitPath" startOffset="0%">
                      LET'S ROCK! ★ LET'S ROCK! ★ LET'S ROCK! ★ LET'S ROCK! ★ LET'S ROCK! ★ LET'S ROCK!
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
            <div className="hub-trigger group" onClick={() => router.push('/loading')}>
              <div className="absolute inset-0 border-4 border-white/10 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700"></div>
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-headline font-black tracking-tight text-black text-center text-[calc(var(--size-lg)_+_4px)] leading-none">ENTER<br/>The Void</span>
            </div>
          </div>
        </main>
        
        {/* Decorative Corner Elements */}
        <div className="fixed top-0 left-0 p-10 z-20 pointer-events-none opacity-30">
          <div className="w-24 h-24 border-t border-l border-white"></div>
        </div>
        <div className="fixed bottom-0 left-0 p-10 z-20 pointer-events-none opacity-30">
          <div className="w-24 h-24 border-b border-l border-white"></div>
        </div>
        <div className="fixed top-0 right-0 p-10 z-20 pointer-events-none opacity-30">
          <div className="w-24 h-24 border-t border-r border-white"></div>
        </div>
        <div className="fixed bottom-0 right-0 p-10 z-20 pointer-events-none opacity-30">
          <div className="w-24 h-24 border-b border-r border-white"></div>
        </div>
      </div>
    </>
  );
}
