/**
 * Gate selection panel — buttons for each Phase 1 gate plus undo/reset.
 * UI rendering only. No math logic. No engine imports.
 */

import { useQuantumActions, useGateHistory } from '../hooks/useQuantumActions.js';
import { PHASE1_GATES, GATE_INFO } from '../constants/gates.js';
import { GATE_BADGE_COLORS } from '../constants/colors.js';

function GateButton({ gateKey, onApply }) {
  const color = GATE_BADGE_COLORS[gateKey] || '#64748B';
  const info = GATE_INFO[gateKey];

  return (
    <button
      id={`gate-btn-${gateKey}`}
      onClick={() => onApply(gateKey)}
      className="group relative flex flex-col items-center justify-center
                 w-full aspect-square rounded-xl
                 border border-white/10 transition-all duration-200
                 hover:scale-105 hover:border-white/20
                 active:scale-95 cursor-pointer"
      style={{
        backgroundColor: `${color}11`,
        boxShadow: `0 0 0px ${color}00`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = `${color}22`;
        e.currentTarget.style.boxShadow = `0 0 20px ${color}33`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = `${color}11`;
        e.currentTarget.style.boxShadow = `0 0 0px ${color}00`;
      }}
      title={info?.description || gateKey}
    >
      <span
        className="text-xl font-mono font-bold"
        style={{ color }}
      >
        {gateKey}
      </span>
      <span className="text-[10px] text-white/40 mt-0.5 leading-tight">
        {info?.name || ''}
      </span>
    </button>
  );
}

function ActionButton({ id, onClick, disabled, children, variant }) {
  const base = `flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg
                text-xs font-medium transition-all duration-200
                border cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`;

  const variants = {
    undo: 'border-quantum-cyan/20 text-quantum-cyan hover:bg-quantum-cyan/10 hover:border-quantum-cyan/40',
    reset: 'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40',
  };

  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || ''}`}
    >
      {children}
    </button>
  );
}

export default function GatePanel() {
  const { applyGate, undo, reset } = useQuantumActions();
  const { historyLength } = useGateHistory();
  const isEmpty = historyLength === 0;

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-4">
      <h2 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
        Quantum Gates
      </h2>

      {/* Gate grid */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {PHASE1_GATES.map((gateKey) => (
          <GateButton key={gateKey} gateKey={gateKey} onApply={applyGate} />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <ActionButton
          id="btn-undo"
          onClick={undo}
          disabled={isEmpty}
          variant="undo"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
          </svg>
          Undo
        </ActionButton>
        <ActionButton
          id="btn-reset"
          onClick={reset}
          disabled={isEmpty}
          variant="reset"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </ActionButton>
      </div>
    </div>
  );
}
