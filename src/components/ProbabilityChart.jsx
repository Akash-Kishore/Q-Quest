import React from 'react';
import { useQuantumStore } from '../store/quantumStore.js';

export default function ProbabilityChart() {
  const probabilities = useQuantumStore(s => s.probabilities);
  
  // Filter out noise to prevent charting 64 bars if 63 are empty
  const activeProbs = probabilities.filter(p => p.probability > 0.001);

  if (activeProbs.length === 0) {
      return <div className="h-24 flex items-center justify-center text-white/20 italic text-sm">Waiting for probability data...</div>;
  }

  // Find max probability to scale bars relative to the highest peak for better visibility if none are near 1.0 (though quantum sums to 1)
  // Scaling relative to 100% since sum equals 1 is usually safer for pure physics interpretation
  const scaleRef = 1.0; 

  return (
    <div className="w-full h-32 overflow-x-auto overflow-y-hidden flex items-end gap-1 px-4 pb-8 scrollbar-thin relative">
       {/* Background Grid Lines optional, omitting for minimalist aesthetic requested */}
       
       <div className="flex h-full items-end gap-1.5 pt-4">
           {activeProbs.map((p, idx) => {
               const heightPct = (p.probability / scaleRef) * 100;
               return (
                   <div key={p.basis} className="flex flex-col items-center group relative h-full justify-end">
                       
                       {/* Tooltip */}
                       <div className="absolute -top-6 bg-black/90 px-2 py-1 rounded text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-white/20 shadow-xl pointer-events-none">
                           |{p.basis}⟩ : {(p.probability * 100).toFixed(2)}%
                       </div>

                       {/* Bar */}
                       <div className="w-6 rounded-t bg-gradient-to-t from-[#00D4FF] to-[#7C3AED] transition-all duration-300 relative group-hover:brightness-125"
                            style={{ 
                                height: `${Math.max(1, heightPct)}%`,
                                minHeight: '4px' // Ensure visible even if tiny
                            }}
                       >
                           {/* Glow effect at top inner edge */}
                           <div className="absolute top-0 w-full h-1 bg-white/40 rounded-t" />
                       </div>

                       {/* Rotated Label */}
                       <span className="absolute -bottom-7 text-[9px] font-mono text-white/40 -rotate-45 origin-top-left transform translate-y-1">
                           |{p.basis}⟩
                       </span>
                   </div>
               );
           })}
       </div>
    </div>
  );
}
