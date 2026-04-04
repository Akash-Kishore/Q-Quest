import React from 'react';
import { useQuantumStore } from '../../store/quantumStore.js';

export default function StateVectorPanel() {
  const activeQubit = useQuantumStore(s => s.activeQubit);
  const blochCoords = useQuantumStore(s => s.blochCoords[activeQubit]);
  const stateDisplay = useQuantumStore(s => s.stateDisplay);
  const allPurities = useQuantumStore(s => s.blochCoords).map(c => c.purity);

  const formatAmplitudes = (c) => {
     let re = Math.abs(c.re) < 1e-6 ? 0 : c.re;
     let im = Math.abs(c.im) < 1e-6 ? 0 : c.im;
     if (re === 0 && im === 0) return '0';
     if (im === 0) return re.toFixed(4);
     if (re === 0) return `${im.toFixed(4)}i`;
     const sign = im < 0 ? '-' : '+';
     return `${re.toFixed(4)} ${sign} ${Math.abs(im).toFixed(4)}i`;
  };

  const alpha_amp = Math.cos(blochCoords.theta / 2);
  const betaMag = Math.sin(blochCoords.theta / 2);
  const beta_re = betaMag * Math.cos(blochCoords.phi);
  const beta_im = betaMag * Math.sin(blochCoords.phi);
  
  const alphaDisplay = alpha_amp.toFixed(4);
  const betaDisplay = formatAmplitudes({ re: beta_re, im: beta_im });

  const displayLimit = 8;
  const shownStates = stateDisplay.slice(0, displayLimit);
  const hiddenCount = stateDisplay.length - shownStates.length;

  return (
    <div className="glass p-4 flex flex-col gap-4 relative overflow-hidden">
      
      {/* VF-09 Aurora Background */}
      <div className="absolute inset-0 aurora bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#00D4FF]/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 aurora bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#7C3AED]/20 via-transparent to-transparent pointer-events-none" style={{ animationDelay: '-2s' }} />

      <div className="flex justify-between items-center relative z-10">
        <h2 className="text-xs font-display uppercase tracking-[0.15em] text-white/40">
          State Vector |ψ⟩
        </h2>
        {stateDisplay.length > 0 && (
          <span className="px-2 py-[1px] border border-[#00D4FF]/30 text-[#00D4FF] text-[9px] font-mono rounded-full bg-[#00D4FF]/10">
            {stateDisplay.length} STATES
          </span>
        )}
      </div>

      <div className="font-mono text-[11px] grid grid-cols-2 gap-2 relative z-10">
         <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded border border-white/[0.04]">
            <span className="text-white/30">α =</span>
            <span className="text-[#00D4FF]">{alphaDisplay}</span>
         </div>
         <div className="flex justify-between items-center bg-white/[0.02] p-2 rounded border border-white/[0.04] truncate">
            <span className="text-white/30">β =</span>
            <span className="text-[#7C3AED] truncate ml-2" title={betaDisplay}>{betaDisplay}</span>
         </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10 min-h-[60px]">
         {shownStates.length === 0 && (
             <div className="text-center text-white/20 italic text-[11px] py-2">
                 Waiting for superposition...
             </div>
         )}
         {shownStates.map((st, i) => {
             const phaseDeg = st.phase * (180 / Math.PI);
             const hue = phaseDeg + 180;
             const arcX = 8 + 6 * Math.cos(st.phase);
             const arcY = 8 + 6 * Math.sin(st.phase);

             return (
                 <div key={st.basis} className="flex items-center gap-3 text-[11px] font-mono group">
                     <span className="text-white/60 tracking-widest bg-white/[0.02] px-1 rounded">|{st.basis}⟩</span>
                     
                     <div className="flex-1 h-1 bg-white/5 rounded-full relative overflow-visible">
                         <div 
                            className="absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r from-[#00D4FF]/70 to-transparent"
                            style={{ width: `${st.probability * 100}%` }}
                         />
                     </div>
                     
                     <svg width="16" height="16" className="overflow-visible" title={`Phase: ${phaseDeg.toFixed(1)}°`}>
                         <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                         <path 
                           d={`M 8 8 L ${arcX} ${arcY}`} 
                           stroke={`hsl(${hue}, 80%, 65%)`} 
                           strokeWidth="1.5" 
                           strokeLinecap="round" 
                         />
                     </svg>

                     <span className="text-white/50 w-12 text-right tabular-nums">{(st.probability * 100).toFixed(1)}%</span>
                 </div>
             );
         })}
         {hiddenCount > 0 && (
             <div className="text-[9px] text-center text-white/25 border-t border-white/5 pt-1 mt-1 font-mono uppercase tracking-widest">
                  + {hiddenCount} more states
             </div>
         )}
      </div>

      <div className="pt-3 border-t border-white/[0.06] relative z-10">
         <p className="text-[9px] font-mono uppercase tracking-[0.15em] text-white/25 mb-2">State Purity</p>
         <div className="flex justify-between gap-1">
             {allPurities.map((p, i) => {
                 let colorClass = 'bg-[#7C3AED]';
                 if (p > 0.99) colorClass = 'bg-[#00D4FF]';
                 else if (p > 0.5) colorClass = 'bg-[#06B6D4]';

                 return (
                     <div key={i} className="flex-1 flex flex-col items-center gap-1">
                         <span className="text-[8px] font-mono text-white/20">q{i}</span>
                         <div className="w-full h-1 bg-white/[0.04] rounded-sm overflow-hidden">
                             <div className={`h-full ${colorClass} transition-all duration-300`} style={{ width: `${p * 100}%` }} />
                         </div>
                     </div>
                 );
             })}
         </div>
      </div>
    </div>
  );
}
