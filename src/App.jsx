import React from 'react';
import { useQuantumStore } from './store/quantumStore.js';

import QuantumField from './components/background/QuantumField.jsx';
import QuantumCursor from './components/cursor/QuantumCursor.jsx';
import GateLibrary from './components/ui/GateLibrary.jsx';
import CircuitBoard from './components/circuit/CircuitBoard.jsx';
import ProbabilityChart from './components/panels/ProbabilityChart.jsx';
import BlochSphere from './components/bloch/BlochSphere.jsx';
import MiniBlochRow from './components/bloch/MiniBlochRow.jsx';
import StateVectorPanel from './components/panels/StateVectorPanel.jsx';
import LinearAlgebraPanel from './components/panels/LinearAlgebraPanel.jsx';

export default function App() {
  const activeQubit = useQuantumStore(s => s.activeQubit);
  const isEntangled = useQuantumStore(s => s.isEntangled);
  const circuitDepth = useQuantumStore(s => s.circuitDepth);
  const isAnimating = useQuantumStore(s => s.isAnimating);

  return (
    <div className="flex flex-col h-screen bg-[#0A0A0B] overflow-hidden relative">
      <QuantumField />
      <QuantumCursor />

      {/* HEADER */}
      <header className="relative z-10 flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0 bg-[rgba(10,10,11,0.8)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md border border-[#00D4FF]/30 flex items-center justify-center bg-[#00D4FF]/10">
            <span className="font-display font-bold text-[#00D4FF] text-xs">Q</span>
          </div>
          <div>
            <span className="font-display font-bold text-white text-sm tracking-tight">Q-Quest</span>
            <span className="ml-2 text-white/30 text-[10px] font-mono uppercase tracking-[0.15em]">
              Quantum Gate Explorer
            </span>
          </div>
        </div>

        {/* VF-10: Live status */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full status-dot ${
              isAnimating ? 'bg-[#00D4FF]' :
              isEntangled ? 'bg-[#7C3AED]' : 'bg-[#10B981]'
            }`} />
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.1em]">
              6-Qubit Simulator
            </span>
          </div>
          {circuitDepth > 0 && (
            <span className="text-[10px] font-mono text-white/25">
              Depth: {circuitDepth}
            </span>
          )}
          {isEntangled && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono border border-[#7C3AED]/40 text-[#7C3AED]/80 rounded uppercase tracking-widest">
              ENT
            </span>
          )}
          <a href="https://github.com/Akash-Kishore/q-quest" target="_blank" rel="noopener noreferrer" className="text-white/25 hover:text-white/60 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* THREE-COLUMN MAIN */}
      <div className="relative z-10 flex flex-1 overflow-hidden gap-3 p-3">

        {/* LEFT — Gate Library */}
        <aside className="w-56 flex-shrink-0 overflow-y-auto">
          <div className="glass h-full">
            <GateLibrary />
          </div>
        </aside>

        {/* CENTER — Circuit + Probabilities */}
        <main className="flex-1 flex flex-col overflow-hidden gap-3 min-w-0">
          <div className="flex-1 overflow-hidden glass relative">
            <CircuitBoard />
          </div>
          <div className="flex-shrink-0 glass p-3 pb-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 mb-3 px-2">
              Measurement Probabilities
            </p>
            <ProbabilityChart />
          </div>
        </main>

        {/* RIGHT — Bloch + State + Math */}
        <aside className="w-[300px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto scrollbar-thin">
          <div className="glass bloch-active-container p-2 flex-shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 mb-1 px-1">
              Bloch Sphere — q[{activeQubit}]
            </p>
            <div className="aspect-square w-full">
              <BlochSphere qubitIndex={activeQubit} />
            </div>
          </div>

          <div className="glass p-3 flex-shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-white/25 mb-2">
              All Qubits
            </p>
            <MiniBlochRow />
          </div>

          <StateVectorPanel />
          <LinearAlgebraPanel />
        </aside>
      </div>
    </div>
  );
}
