import React from 'react';
import { useQuantumStore } from '../../store/quantumStore.js';

export default function ProbabilityChart() {
  const probabilities = useQuantumStore(s => s.probabilities);
  
  // Filter out tiny values for chart, but always keep at least the largest one
  const sorted = [...probabilities].sort((a,b) => b.probability - a.probability);
  let visible = probabilities.filter(p => p.probability > 0.001);
  if (visible.length === 0) visible = [sorted[0]];
  
  const maxProb = sorted[0]?.probability || 1;

  if (visible.length === 1 && visible[0].basis === '000000' && visible[0].probability > 0.999) {
    return (
       <div className="h-28 w-full flex flex-col items-center justify-end px-4">
           <div 
             className="w-16 flex-shrink-0 relative rounded-t"
             style={{ 
               height: '100%', 
               background: 'linear-gradient(to top, #00D4FF, #7C3AED)',
               boxShadow: '0 0 12px rgba(0,212,255,0.3)',
               transition: 'height 400ms cubic-bezier(0.16,1,0.3,1)'
             }}
           >
               <div className="absolute top-0 left-0 right-0 h-px bg-[#00D4FF]/80 animate-pulse" />
           </div>
           <div className="mt-2 text-[10px] font-mono text-white/50 tracking-widest text-center w-full">
               |000000⟩<br/>
               <span className="text-[#00D4FF] mt-1 inline-block">100.0%</span>
           </div>
       </div>
    );
  }

  return (
    <div className="h-28 w-full overflow-x-auto overflow-y-hidden flex items-end gap-[2px] pb-6 scrollbar-thin px-2">
      {probabilities.map((item, i) => {
         // Render all elements to preserve DOM node identity, scale height and opacity instead of unmounting
         const isActive = Math.abs(item.probability - maxProb) < 1e-6 && item.probability > 0;
         const isVisible = item.probability > 0.0001;
         
         if (!isVisible) {
             return (
                 <div key={item.basis} className="w-[1px] bg-white/5 flex-shrink-0 h-1 mt-auto" />
             );
         }

         return (
           <div key={item.basis} className="flex flex-col items-center shrink-0 w-5 relative group mt-auto h-full justify-end">
               <div 
                 className="w-full rounded-t-sm transition-all duration-400 group-hover:w-[22px] relative"
                 style={{ 
                    height: `${Math.max(3, item.probability * 100)}%`,
                    background: 'linear-gradient(to top, #06B6D4, #7C3AED)',
                    boxShadow: isActive ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
                    transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
                 }}
               >
                  {isActive && <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#00D4FF]/80 animate-pulse" />}
               </div>
               
               <div className="absolute -bottom-5 text-[7px] font-mono text-white/35 -rotate-45 origin-top-left ml-2 whitespace-nowrap">
                   |{item.basis}⟩
               </div>

               {/* Hover Tooltip */}
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-1 bg-black/80 rounded border border-white/10 text-[9px] font-mono text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {(item.probability * 100).toFixed(2)}%
               </div>
           </div>
         );
      })}
    </div>
  );
}
