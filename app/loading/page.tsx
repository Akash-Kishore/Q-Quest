'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const PROCESS_LINES = [
  "// INITIALIZING Q-QUEST CORE...",
  "// CALIBRATING RESONATORS...",
  "// DECRYPTING AGENT STREAMS...",
  "// SYNCHRONIZING QUBITS...",
  "// UNLOCKING DIMENSIONS...",
  "// SCANNING ARCHITECTURE...",
  "// VALIDATING ANCHORS...",
  "// OPTIMIZING CAPACITANCE...",
  "// SECURING UPLINK...",
  "// PURGING REGISTRIES..."
];

export default function LoadingPage() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [latency, setLatency] = useState("0.002");
  const [coord, setCoord] = useState("40.7128");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        if (prev < PROCESS_LINES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsDone(true);
          setTimeout(() => {
             router.push('/home');
          }, 800);
          return prev;
        }
      });
    }, 600);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const telemetryInterval = setInterval(() => {
      setLatency((Math.random() * (0.009 - 0.001) + 0.001).toFixed(3));
      setCoord((40.7128 + (Math.random() - 0.5) * 0.001).toFixed(4));
    }, 200);
    return () => clearInterval(telemetryInterval);
  }, []);

  const lineHeight = 48;
  const offset = - (activeIndex * lineHeight) - (lineHeight / 2);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body {
            margin: 0;
            padding: 0;
            font-family: 'JetBrains Mono', monospace;
            text-transform: uppercase;
        }

        .terminal-container {
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            overflow: hidden;
            background-image: radial-gradient(ellipse at top right, rgba(255,255,255,0.2), #9d4edd, #5a189a);
        }

        .content-wrapper {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1);
            opacity: 1;
        }

        .content-wrapper.fade-out {
            opacity: 0;
            pointer-events: none;
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
            opacity: 0.3;
        }
        
        .bracket-tl { border-top: 1px solid white; border-left: 1px solid white; top: 40px; left: 40px; }
        .bracket-tr { border-top: 1px solid white; border-right: 1px solid white; top: 40px; right: 40px; }
        .bracket-bl { border-bottom: 1px solid white; border-left: 1px solid white; bottom: 40px; left: 40px; }
        .bracket-br { border-bottom: 1px solid white; border-right: 1px solid white; bottom: 40px; right: 40px; }

        .corner-square {
            position: absolute;
            width: 12px;
            height: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .square-tl { top: 46px; left: 46px; }
        .square-tr { top: 46px; right: 46px; }
        .square-bl { bottom: 46px; left: 46px; }
        .square-br { bottom: 46px; right: 46px; }

        .main-layout {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            width: 100%;
            max-width: 1536px;
            align-items: center;
            padding-left: 64px;
            padding-right: 64px;
            z-index: 10;
            gap: 64px;
            animation: fadeIn 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            opacity: 0;
        }

        @keyframes fadeIn {
            to { opacity: 1; }
        }

        #process-list-container {
            height: 240px;
            position: relative;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            text-align: left;
            font-size: 16px;
            letter-spacing: 0.1em;
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
            color: #5a189a;
            font-weight: 700;
        }

        .status-container {
            display: flex;
            justify-content: center;
        }

        #loading-status {
            color: white;
            font-size: 30px;
            line-height: 36px;
            letter-spacing: 0.6em;
            font-weight: 700;
            white-space: nowrap;
            font-family: 'JetBrains Mono', monospace;
        }

        .telemetry-section {
            text-align: right;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 32px;
        }

        .telemetry-p {
            color: white;
            font-size: 14px;
            line-height: 1.625;
            max-width: 340px;
            opacity: 0.8;
            font-family: 'JetBrains Mono', monospace;
        }

        .telemetry-divider {
            height: 1px;
            width: 100%;
            background-color: rgba(255,255,255,0.2);
        }

        .telemetry-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            column-gap: 32px;
            row-gap: 16px;
            width: 100%;
            font-size: 13px;
            color: rgba(255,255,255,0.6);
        }

        .telemetry-item {
            display: flex;
            flex-direction: column;
        }

        .telemetry-label {
            color: rgba(255,255,255,0.4);
        }

        .telemetry-value {
            color: white;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        .animate-pulse-custom {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />

      <div className="terminal-container">
        <div className={`content-wrapper ${isDone ? 'fade-out' : ''}`}>
          {/* CELESTIAL BACKGROUND LAYER */}
          <div className="celestial-overlay"></div>
          
          {/* CORNER BRACKETS & SQUARES */}
          <div className="terminal-bracket bracket-tl"></div>
          <div className="corner-square square-tl"></div>
          
          <div className="terminal-bracket bracket-tr"></div>
          <div className="corner-square square-tr"></div>
          
          <div className="terminal-bracket bracket-bl"></div>
          <div className="corner-square square-bl"></div>
          
          <div className="terminal-bracket bracket-br"></div>
          <div className="corner-square square-br"></div>
          
          {/* MAIN TERMINAL LAYOUT */}
          <main className="main-layout">
            {/* LEFT: PROCESS LIST (ROLLING TICKER) */}
            <div id="process-list-container">
              <div id="highlight-bar"></div>
              <div id="process-scroller" style={{ transform: `translateY(${offset}px)` }}>
                {PROCESS_LINES.map((line, idx) => (
                  <div key={idx} className={`process-line ${idx === activeIndex ? 'active' : ''}`}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
            
            {/* CENTER: STATUS */}
            <div className="status-container">
              <div 
                  id="loading-status" 
                  className={isDone ? '' : 'animate-pulse-custom'}
              >
                  {isDone ? '( DONE )' : '( LOADING )'}
              </div>
            </div>
            
            {/* RIGHT: TELEMETRY */}
            <div className="telemetry-section">
              <p className="telemetry-p">
                  // HANG TIGHT, EXPLORER. THE DATA TRANSFER IS IN PROGRESS. CALIBRATING REINFORCEMENT LEARNING AGENTS FOR OPTIMAL RESONANCE.
              </p>
              <div className="telemetry-divider"></div>
              <div className="telemetry-grid">
                <div className="telemetry-item">
                  <span className="telemetry-label">LATENCY</span>
                  <span className="telemetry-value" id="telemetry-latency">{latency}MS</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">BUFFER</span>
                  <span className="telemetry-value">OPTIMIZED</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">UPLINK</span>
                  <span className="telemetry-value">SECURE</span>
                </div>
                <div className="telemetry-item">
                  <span className="telemetry-label">COORD</span>
                  <span className="telemetry-value" id="telemetry-coord">{coord} N</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

