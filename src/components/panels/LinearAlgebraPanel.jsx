import React, { useState } from 'react';
import { useQuantumStore } from '../../store/quantumStore.js';
import { SINGLE_GATES } from '../../constants/gates.js';

export default function LinearAlgebraPanel() {
  const algebra = useQuantumStore(s => s.linearAlgebra);
  const [qiskitOpen, setQiskitOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!algebra) {
    return (
      <div className="glass p-8 flex flex-col items-center justify-center relative min-h-[160px]">
        <div className="w-2 h-2 rounded-full bg-[#00D4FF] opacity-40 animate-pulse mb-3" />
        <p className="font-mono text-[11px] text-white/20 uppercase tracking-widest text-center">
          — apply a gate to see —
          <br />
          linear algebra details
        </p>
      </div>
    );
  }

  const { gateName, gateMatrix, tensorNotation, inputAmplitudes, outputAmplitudes, analogy, qiskitCode } = algebra;

  const formatComplex = (c) => {
    if (!c) return '0.0000';
    const re = Math.abs(c.re) < 1e-10 ? 0 : c.re;
    const im = Math.abs(c.im) < 1e-10 ? 0 : c.im;

    if (Math.abs(re - 1/Math.sqrt(2)) < 1e-4) return "1/√2";
    if (Math.abs(re + 1/Math.sqrt(2)) < 1e-4) return "-1/√2";
    if (re === 0 && im === 1) return "i";
    if (re === 0 && im === -1) return "-i";
    if (re === -1 && im === 0) return "-1";
    if (re === 1 && im === 0) return "1";

    if (im === 0) return re.toFixed(4);
    if (re === 0) return `${im.toFixed(4)}i`;
    const sign = im < 0 ? '-' : '+';
    return `${re.toFixed(4)}${sign}${Math.abs(im).toFixed(4)}i`;
  };

  const handleCopy = () => {
     navigator.clipboard.writeText(qiskitCode);
     setCopied(true);
     setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="glass flex flex-col overflow-hidden relative">
      <div className="p-3 border-b border-white/[0.06] bg-black/20">
        <div className="flex justify-between items-center mb-2">
            <h2 className="text-[10px] font-display uppercase tracking-[0.15em] text-white/40">Linear Algebra</h2>
            <div className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[10px] font-mono">{gateName}</div>
        </div>
        <div className="px-2 py-1.5 bg-black/40 rounded border border-white/5 font-mono text-[10px] text-white/60 text-center tracking-widest">
            {tensorNotation}
        </div>
        <p className="mt-2 text-[10px] text-white/40 italic font-sans px-1 text-center">
            → {analogy}
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
         {/* Matrix Display */}
         {gateMatrix && gateMatrix.length === 2 && (
             <div className="flex flex-col items-center">
                 <div className="text-[9px] text-white/20 mb-1 font-mono uppercase tracking-widest">Gate Operator</div>
                 <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10 rounded overflow-hidden p-px">
                     {gateMatrix.flat().map((c, i) => (
                         <div key={i} className="bg-[#0A0A0B] px-3 py-1.5 text-center font-mono text-[10px] tabular-nums text-[#00D4FF]">
                             {formatComplex(c)}
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* 2x2 Operation visualization if applicable */}
         {gateMatrix && gateMatrix.length === 2 && inputAmplitudes && (
             <div className="pt-3 border-t border-white/[0.04] flex flex-col items-center">
                 <div className="text-[9px] text-white/20 mb-2 font-mono uppercase tracking-widest">State Evolution (Top |0⟩ |1⟩)</div>
                 <div className="flex items-center gap-2 font-mono text-[9px] w-full justify-center text-white/50">
                     <span className="text-[#00D4FF]">U</span>
                     <span className="text-white/30">·</span>
                     <div className="flex flex-col gap-1 px-2 border-l border-r border-white/10 py-1">
                        <div>{formatComplex(inputAmplitudes[0])}</div>
                        <div>{formatComplex(inputAmplitudes[1])}</div>
                     </div>
                     <span className="text-white/30">=</span>
                     <div className="flex flex-col gap-1 px-2 border-l border-r border-[#7C3AED]/30 py-1 text-[#7C3AED]">
                        <div>{formatComplex(outputAmplitudes[0])}</div>
                        <div>{formatComplex(outputAmplitudes[1])}</div>
                     </div>
                 </div>
             </div>
         )}
      </div>

      {/* Qiskit Block */}
      <div className="border-t border-white/[0.06] bg-[#0A0A0B]/50">
         <button 
           onClick={() => setQiskitOpen(!qiskitOpen)}
           className="w-full px-3 py-2 flex justify-between items-center text-[10px] uppercase font-mono tracking-widest text-white/40 hover:text-white/60 bg-transparent transition-colors"
         >
            <span>Qiskit Equivalent</span>
            <span className="text-[8px]">{qiskitOpen ? '▼' : '▶'}</span>
         </button>
         
         {qiskitOpen && (
             <div className="relative p-3 pt-0 bg-[#0A0A0B]">
                 <pre className="p-3 bg-[#0D1117] rounded border border-white/10 font-mono text-[9px] overflow-x-auto">
                     <code>
                       <span className="text-[#7C3AED]">qc.</span>
                       <span className="text-[#00D4FF]">{qiskitCode.split('qc.')[1]}</span>
                     </code>
                 </pre>
                 <button 
                    onClick={handleCopy}
                    className="absolute top-2 right-4 text-[9px] font-mono bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-white/60 transition-colors"
                 >
                     {copied ? 'Copied!' : 'Copy'}
                 </button>
             </div>
         )}
      </div>
    </div>
  );
}
