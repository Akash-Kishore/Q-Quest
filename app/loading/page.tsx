'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const scroller = document.getElementById('process-scroller');
    const lines = document.querySelectorAll('.process-line');
    const status = document.getElementById('loading-status');
    const lineHeight = 48;
    let activeIndex = 0;

    function updateDisplay() {
        const offset = - (activeIndex * lineHeight) - (lineHeight / 2);
        if (scroller) scroller.style.transform = `translateY(${offset}px)`;

        lines.forEach((line, index) => {
            if (index === activeIndex) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }

    updateDisplay();

    const interval = setInterval(() => {
        activeIndex++;

        if (activeIndex < lines.length) {
            updateDisplay();
        } else {
            clearInterval(interval);
            if (status) {
                status.textContent = '( DONE )';
                status.classList.remove('animate-pulse-custom');
            }
            activeIndex = lines.length - 1;
            updateDisplay();
            // Automatically route to /home after finishing
            setTimeout(() => {
                router.push('/home');
            }, 800);
        }
    }, 600);

    const latencyEl = document.getElementById('telemetry-latency');
    const coordEl = document.getElementById('telemetry-coord');

    function updateTelemetry() {
        const randomLatency = (Math.random() * (0.009 - 0.001) + 0.001).toFixed(3);
        if (latencyEl) latencyEl.textContent = `${randomLatency}MS`;

        const baseCoord = 40.7128;
        const fluctuation = (Math.random() - 0.5) * 0.001;
        const newCoord = (baseCoord + fluctuation).toFixed(4);
        if (coordEl) coordEl.textContent = `${newCoord} N`;
    }

    const telemetryInterval = setInterval(updateTelemetry, 200);

    return () => {
        clearInterval(interval);
        clearInterval(telemetryInterval);
    };
  }, [router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body {
            margin: 0;
            padding: 0;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
        }

        .celestial-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            background-image: radial-gradient(circle, white 1px, transparent 1px);
            background-size: 80px 80px;
            opacity: 0.4;
        }

        .terminal-bracket {
            position: absolute;
            width: 24px;
            height: 24px;
        }

        .corner-square {
            position: absolute;
            width: 12px;
            height: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Process List Carousel Logic */
        #process-list-container {
            height: 240px; /* 5 rows of 48px */
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
        }

        #highlight-bar {
            position: absolute;
            left: 0;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            height: 48px;
            background-color: white;
            z-index: 1;
        }

        #process-scroller {
            position: absolute;
            width: 100%;
            top: 50%;
            transform: translateY(0);
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
            z-index: 2;
        }

        .process-line {
            height: 48px;
            display: flex;
            align-items: center;
            padding-left: 12px;
            padding-right: 12px;
            color: rgba(255, 255, 255, 0.7);
            transition: color 0.3s ease;
            white-space: nowrap;
        }

        .process-line.active {
            color: #5a189a; /* Inverted color when in highlight bar */
            font-weight: 700;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .animate-pulse-custom {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />

      <div className="bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-[#9d4edd] to-[#5a189a] relative flex flex-col justify-center items-center w-screen h-screen overflow-hidden">
        {/* CELESTIAL BACKGROUND LAYER */}
        <div className="celestial-overlay"></div>
        
        {/* CORNER BRACKETS & SQUARES */}
        {/* Top Left */}
        <div className="terminal-bracket border-t border-l top-[40px] left-[40px] border-white opacity-30"></div>
        <div className="corner-square top-[46px] left-[46px]"></div>
        {/* Top Right */}
        <div className="terminal-bracket border-t border-r top-[40px] right-[40px] border-white opacity-30"></div>
        <div className="corner-square top-[46px] right-[46px]"></div>
        {/* Bottom Left */}
        <div className="terminal-bracket border-b border-l bottom-[40px] left-[40px] border-white opacity-30"></div>
        <div className="corner-square bottom-[46px] left-[46px]"></div>
        {/* Bottom Right */}
        <div className="terminal-bracket border-b border-r bottom-[40px] right-[40px] border-white opacity-30"></div>
        <div className="corner-square bottom-[46px] right-[46px]"></div>
        
        {/* MAIN TERMINAL LAYOUT */}
        <main className="grid grid-cols-3 w-full max-w-screen-2xl items-center px-16 z-10 gap-16">
          {/* LEFT: PROCESS LIST (ROLLING TICKER) */}
          <div className="flex flex-col text-base tracking-widest text-left" id="process-list-container">
            <div id="highlight-bar"></div>
            <div id="process-scroller">
              <div className="process-line">// INITIALIZING Q-QUEST CORE...</div>
              <div className="process-line">// CALIBRATING RESONATORS...</div>
              <div className="process-line">// DECRYPTING AGENT STREAMS...</div>
              <div className="process-line">// SYNCHRONIZING QUBITS...</div>
              <div className="process-line">// UNLOCKING DIMENSIONS...</div>
              <div className="process-line">// SCANNING ARCHITECTURE...</div>
              <div className="process-line">// VALIDATING ANCHORS...</div>
              <div className="process-line">// OPTIMIZING CAPACITANCE...</div>
              <div className="process-line">// SECURING UPLINK...</div>
              <div className="process-line">// PURGING REGISTRIES...</div>
            </div>
          </div>
          
          {/* CENTER: STATUS */}
          <div className="flex justify-center">
            <div className="text-white text-3xl tracking-[0.6em] font-bold animate-pulse-custom whitespace-nowrap" id="loading-status" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                ( LOADING )
            </div>
          </div>
          
          {/* RIGHT: TELEMETRY */}
          <div className="text-right flex flex-col items-end gap-8">
            <p className="text-white text-[14px] leading-relaxed max-w-[340px] opacity-80 font-mono">
                // HANG TIGHT, EXPLORER. THE DATA TRANSFER IS IN PROGRESS. CALIBRATING REINFORCEMENT LEARNING AGENTS FOR OPTIMAL RESONANCE.
            </p>
            <div className="h-[1px] w-full bg-white/20"></div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-[13px] text-white/60">
              <div className="flex flex-col">
                <span className="text-white/40">LATENCY</span>
                <span className="text-white" id="telemetry-latency">0.002ms</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">BUFFER</span>
                <span className="text-white">OPTIMIZED</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">UPLINK</span>
                <span className="text-white">SECURE</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/40">COORD</span>
                <span className="text-white" id="telemetry-coord">40.7128 N</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
