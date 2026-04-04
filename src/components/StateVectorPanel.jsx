import React from 'react';
import { useQuantumStore } from '../store/quantumStore.js';

export default function StateVectorPanel() {
  // Using direct selectors from Zustand for optimal rendering
  const activeQubit = useQuantumStore(s => s.activeQubit);
  const blochCoords = useQuantumStore(s => s.blochCoords)[activeQubit];
  const stateDisplay = useQuantumStore(s => s.stateDisplay);
  const allPurities = useQuantumStore(s => s.blochCoords).map(c => c.purity);

  // Format helper for display only
  const formatAmplitudes = (c) => {
     let re = Math.abs(c.re) < 1e-6 ? 0 : c.re;
     let im = Math.abs(c.im) < 1e-6 ? 0 : c.im;
     if (re===0 && im===0) return '0';
     if (im===0) return re.toFixed(4);
     if (re===0) return `${im.toFixed(4)}i`;
     const sign = im < 0 ? '-' : '+';
     return `${re.toFixed(4)} ${sign} ${Math.abs(im).toFixed(4)}i`;
  };

  // Extract rough alpha/beta from bloch coords for display (approximation based on polar coords)
  const alphaDisplay = Math.cos(blochCoords.theta / 2).toFixed(4);
  const betaMag = Math.sin(blochCoords.theta / 2);
  const betaDisplay = `${(betaMag * Math.cos(blochCoords.phi)).toFixed(4)} + ${(betaMag * Math.sin(blochCoords.phi)).toFixed(4)}i`;

  const displayLimit = 8;
  const shownStates = stateDisplay.slice(0, displayLimit);
  const hiddenCount = stateDisplay.length - shownStates.length;

  return (
    <div className="glass p-3 flex flex-col gap-3">
      <h2 className="text-xs font-mono font-bold text-white/50 tracking-widest px-1">
        STATE VECTOR |ψ⟩
      </h2>

      {/* Active Qubit Amplitudes */}
      <div className="bg-white/5 rounded-lg p-2 font-mono text-xs flex justify-between">
         <div className="flex gap-1">
            <span className="text-white/40">α =</span>
            <span className="text-[#00D4FF]">{alphaDisplay}</span>
         </div>
         <div className="flex gap-1">
            <span className="text-white/40">β =</span>
            <span className="text-[#7C3AED] truncate max-w-[100px]">{betaDisplay}</span>
         </div>
      </div>

      {/* Non-Zero Basis States */}
      <div className="flex flex-col gap-1.5">
         {shownStates.map((st, i) => (
             <div key={st.basis} className="flex items-center gap-2 text-xs font-mono">
                 <span className="text-white/70 w-20 shrink-0">|{st.basis}⟩</span>
                 
                 <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden relative">
                     <div 
                        className="h-full bg-gradient-to-r from-[#00D4FF] to-[#7C3AED]"
                        style={{ width: `${st.amplitude * 100}%` }}
                     />
                 </div>
                 
                 {/* Phase Indicator (rough rotating tick) */}
                 <div className="w-3 h-3 rounded-full border border-white/20 relative" title={`Phase: ${(st.phase * 180 / Math.PI).toFixed(1)}°`}>
                     <div className="absolute top-1/2 left-1/2 w-[1px] h-1.5 bg-white origin-bottom" 
                          style={{ transform: `translate(-50%, -100%) rotate(${st.phase}rad)` }} 
                     />
                 </div>

                 <span className="text-white/50 w-12 text-right">{(st.probability * 100).toFixed(1)}%</span>
             </div>
         ))}
         {hiddenCount > 0 && (
             <div className="text-[10px] text-center text-white/30 italic mt-1 pb-1">
                  ... and {hiddenCount} more states
             </div>
         )}
      </div>

      {/* Purity Indicators */}
      <div className="pt-2 border-t border-white/10">
         <div className="text-[10px] text-white/40 uppercase mb-1">State Purity</div>
         <div className="flex justify-between gap-1">
             {allPurities.map((p, i) => {
                 const isPure = p > 0.99;
                 return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-0.5" title={`q[${i}] Purity: ${(p*100).toFixed(1)}%`}>
                         <span className="text-[8px] font-mono text-white/30">q{i}</span>
                         <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                             <div className={`h-full ${isPure ? 'bg-[#00D4FF]' : 'bg-[#7C3AED]'}`} style={{ width: `${p * 100}%` }} />
                         </div>
                     </div>
                 );
             })}
         </div>
      </div>
    </div>
  );
}
