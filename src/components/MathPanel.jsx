/**
 * Math panel — displays state vector, probabilities, Bloch angles, and last gate info.
 * UI rendering only. No engine imports. No direct store mutations.
 */

import { useQubitDisplay } from '../hooks/useQuantumActions.js';
import { formatComplex, formatProbability } from '../engine/quantumMath.js';
import { GATE_INFO } from '../constants/gates.js';
import { GATE_BADGE_COLORS } from '../constants/colors.js';

function StatRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-white/40">{label}</span>
      <span
        className="text-sm font-mono font-medium"
        style={{ color: color || '#FFFFFF' }}
      >
        {value}
      </span>
    </div>
  );
}

function ProbabilityBar({ label, probability, color }) {
  const pct = (probability * 100).toFixed(1);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/40 font-mono">{label}</span>
        <span className="text-white/70 font-mono">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-400 ease-out"
          style={{
            width: `${Math.max(probability * 100, 0.5)}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
    </div>
  );
}

function LastGateDisplay({ lastGate }) {
  if (!lastGate || lastGate === 'UNDO' || lastGate === 'RESET') {
    const label = lastGate === 'UNDO' ? 'Undo' : lastGate === 'RESET' ? 'Reset' : '—';
    return (
      <div className="text-center py-2">
        <span className="text-xs text-white/30 italic">{label}</span>
      </div>
    );
  }

  const info = GATE_INFO[lastGate];
  const color = GATE_BADGE_COLORS[lastGate] || '#64748B';

  return (
    <div className="flex items-center gap-3 py-1">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center
                   text-lg font-mono font-bold border border-white/10"
        style={{
          backgroundColor: `${color}22`,
          borderColor: `${color}44`,
          color,
        }}
      >
        {lastGate}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/80">{info?.name || lastGate}</div>
        <div className="text-[11px] text-white/40 leading-snug truncate">
          {info?.description || ''}
        </div>
      </div>
    </div>
  );
}

export default function MathPanel() {
  const { qubitState, bloch, prob0, prob1, lastGate } = useQubitDisplay();
  const [alpha, beta] = qubitState;

  const thetaDeg = ((bloch.theta * 180) / Math.PI).toFixed(1);
  const phiDeg = ((bloch.phi * 180) / Math.PI).toFixed(1);

  return (
    <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl p-4 space-y-4">
      {/* State vector */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
          State Vector |ψ⟩
        </h3>
        <div className="bg-white/[0.03] rounded-lg p-3 font-mono text-sm space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-white/40">α =</span>
            <span className="text-quantum-teal">{formatComplex(alpha)}</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-white/40">β =</span>
            <span className="text-quantum-purple">{formatComplex(beta)}</span>
          </div>
        </div>
      </section>

      {/* Probabilities */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
          Measurement Probabilities
        </h3>
        <div className="space-y-2">
          <ProbabilityBar label="|0⟩" probability={prob0} color="#00D4FF" />
          <ProbabilityBar label="|1⟩" probability={prob1} color="#7C3AED" />
        </div>
      </section>

      {/* Bloch angles */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
          Bloch Coordinates
        </h3>
        <div className="bg-white/[0.03] rounded-lg p-3 divide-y divide-white/5">
          <StatRow label="θ (theta)" value={`${thetaDeg}°`} color="#00D4FF" />
          <StatRow label="φ (phi)" value={`${phiDeg}°`} color="#7C3AED" />
          <StatRow label="|α|²" value={formatProbability(alpha)} color="#00D4FF" />
          <StatRow label="|β|²" value={formatProbability(beta)} color="#7C3AED" />
        </div>
      </section>

      {/* Last gate */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
          Last Applied
        </h3>
        <LastGateDisplay lastGate={lastGate} />
      </section>
    </div>
  );
}
