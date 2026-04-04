/**
 * Gate history bar — displays the sequence of applied gates as a horizontal circuit.
 * UI rendering only. No math logic. No engine imports.
 */

import { useGateHistory } from '../hooks/useQuantumActions.js';
import { GATE_BADGE_COLORS } from '../constants/colors.js';

function GateBadge({ gateKey, index }) {
  const color = GATE_BADGE_COLORS[gateKey] || '#64748B';
  return (
    <div
      className="flex items-center shrink-0"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      {index > 0 && (
        <div className="w-4 h-px bg-white/20 shrink-0" />
      )}
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center
                   text-sm font-mono font-bold text-white
                   border border-white/10 shadow-lg
                   animate-[fadeScale_200ms_ease-out_both]"
        style={{
          backgroundColor: `${color}22`,
          borderColor: `${color}44`,
          boxShadow: `0 0 12px ${color}33`,
          animationDelay: `${index * 40}ms`,
        }}
      >
        {gateKey}
      </div>
    </div>
  );
}

export default function GateHistoryBar() {
  const { gateHistory, historyLength } = useGateHistory();

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
          Circuit
        </span>
        <span className="text-xs text-white/30 font-mono">
          {historyLength} gate{historyLength !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex items-center gap-0 overflow-x-auto pb-1 min-h-[44px]
                      scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Initial state label */}
        <div className="shrink-0 text-xs font-mono text-quantum-teal/70 pr-1">
          |0⟩
        </div>

        {historyLength === 0 ? (
          <div className="text-xs text-white/20 italic pl-2">
            No gates applied
          </div>
        ) : (
          gateHistory.map((gateKey, idx) => (
            <GateBadge key={`${idx}-${gateKey}`} gateKey={gateKey} index={idx} />
          ))
        )}

        {/* Wire end */}
        {historyLength > 0 && (
          <>
            <div className="w-4 h-px bg-white/20 shrink-0" />
            <div className="shrink-0 text-xs font-mono text-quantum-purple/70">
              |ψ⟩
            </div>
          </>
        )}
      </div>
    </div>
  );
}
