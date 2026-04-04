import React, { useState } from 'react';
import { useQuantumStore } from '../store/quantumStore.js';

// Inlined formatter to avoid importing engine into components
const formatCmplx = (c) => {
    let re = Math.abs(c.re) < 1e-6 ? 0 : c.re;
    let im = Math.abs(c.im) < 1e-6 ? 0 : c.im;

    // Special cases
    if (Math.abs(re - 0.7071) < 0.001) re = '1/√2';
    if (Math.abs(re + 0.7071) < 0.001) re = '-1/√2';
    if (Math.abs(im - 0.7071) < 0.001) im = '1/√2';
    if (Math.abs(im + 0.7071) < 0.001) im = '-1/√2';

    if (re === 0 && im === 0) return '0';
    if (im === 0) return typeof re === 'number' ? re.toFixed(4).replace(/\.0000$/, '') : re;
    if (re === 0) {
        if (im === 1) return 'i';
        if (im === -1) return '-i';
        return `${typeof im === 'number' ? im.toFixed(4).replace(/\.0000$/, '') : im}i`;
    }

    const sign = im < 0 || im === '-1/√2' ? '-' : '+';
    const absIm = Math.abs(im);
    const absImStr = Math.abs(im - 1) < 1e-6 ? '' : (typeof absIm === 'number' ? absIm.toFixed(4).replace(/\.0000$/, '') : typeof im === 'string' && im.includes('-') ? im.substring(1) : im);

    return `${typeof re === 'number' ? re.toFixed(4).replace(/\.0000$/, '') : re} ${sign} ${absImStr}i`;
};

export default function LinearAlgebraPanel() {
  const linearAlgebra = useQuantumStore(s => s.linearAlgebra);
  const lastApplied = useQuantumStore(s => s.lastApplied);
  const [showCode, setShowCode] = useState(false);

  if (!linearAlgebra) {
     return (
        <div className="glass p-6 text-center text-white/30 text-sm italic">
           {lastApplied === 'RESET' || lastApplied === 'REMOVE' 
               ? "Apply a gate to see the linear algebra"
               : "Apply a single-qubit gate to see step-by-step math"}
        </div>
     );
  }

  const { gateName, gateMatrix, tensorNotation, inputAmplitudes, outputAmplitudes, latexExpression, description } = linearAlgebra;

  const handleCopy = () => {
       navigator.clipboard.writeText(`# Qiskit Code for ${gateName}\n# Note: This is pseudo-code for the UI display\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(6)\nq = 0 # target qubit\nqc.${gateName.toLowerCase()}(q)`);
  };

  return (
    <div className="glass p-4 flex flex-col gap-4 overflow-y-auto">
       <div className="flex justify-between items-center pb-2 border-b border-white/10">
          <h2 className="text-xs font-mono font-bold text-white/50 tracking-widest">
             LINEAR ALGEBRA
          </h2>
          <span className="px-2 py-0.5 rounded bg-[#00D4FF]/20 text-[#00D4FF] text-xs font-mono border border-[#00D4FF]/50">
             {latexExpression}
          </span>
       </div>

       {/* Tensor Notation */}
       <div className="space-y-1">
           <div className="text-[10px] uppercase text-white/40 tracking-wider">Tensor Approximation</div>
           <div className="font-mono text-sm bg-black/30 p-2 rounded text-center tracking-widest break-all">
               {tensorNotation}
           </div>
           <p className="text-xs text-white/60 italic pt-1 text-center">{description}</p>
       </div>

       {/* Gate Matrix */}
       <div className="space-y-1">
           <div className="text-[10px] uppercase text-white/40 tracking-wider">Gate Matrix G</div>
           <div className="flex justify-center">
               <div className="flex flex-col border-l-2 border-r-2 border-white/40 px-2 py-1 gap-1 w-max">
                   <div className="flex gap-4">
                       <span className="w-16 text-center font-mono text-xs">{formatCmplx(gateMatrix[0][0])}</span>
                       <span className="w-16 text-center font-mono text-xs">{formatCmplx(gateMatrix[0][1])}</span>
                   </div>
                   <div className="flex gap-4">
                       <span className="w-16 text-center font-mono text-xs">{formatCmplx(gateMatrix[1][0])}</span>
                       <span className="w-16 text-center font-mono text-xs">{formatCmplx(gateMatrix[1][1])}</span>
                   </div>
               </div>
           </div>
       </div>

       {/* Operation Simulation */}
       <div className="space-y-1">
           <div className="text-[10px] uppercase text-white/40 tracking-wider">Amplitudes (Top 8 basis bounds)</div>
           <div className="flex flex-row justify-center items-center gap-2 overflow-x-auto pb-2">
               {/* G notation abstract */}
               <div className="text-lg font-serif italic text-white/70">G</div>
               <span className="text-white/40">·</span>
               {/* Input Vector Slice */}
               <div className="flex flex-col border-l-2 border-r-2 border-[#00D4FF]/40 px-1 py-1 gap-1">
                    {inputAmplitudes.map((c, i) => (
                        <span key={i} className="text-[10px] font-mono text-right min-w-[60px] text-[#00D4FF]">{formatCmplx(c)}</span>
                    ))}
               </div>
               <span className="text-white/40">=</span>
               {/* Output Vector Slice */}
               <div className="flex flex-col border-l-2 border-r-2 border-[#7C3AED]/40 px-1 py-1 gap-1">
                    {outputAmplitudes.map((c, i) => (
                        <span key={i} className="text-[10px] font-mono text-right min-w-[60px] text-[#7C3AED]">{formatCmplx(c)}</span>
                    ))}
               </div>
           </div>
       </div>

       {/* Qiskit Integration Code */}
       <div className="pt-2 border-t border-white/10">
           <button onClick={() => setShowCode(!showCode)} className="text-xs text-[#06B6D4] hover:text-[#00D4FF] flex items-center gap-1 transition-colors">
               <span>{showCode ? '▼' : '▶'}</span> Qiskit Code
           </button>
           
           {showCode && (
               <div className="mt-2 relative">
                   <pre className="text-[10px] font-mono bg-black/40 p-3 rounded-lg text-white/80 overflow-x-auto border border-white/5">
                        <span className="text-[#F59E0B]">import</span> <span className="text-white">QuantumCircuit</span> <span className="text-[#F59E0B]">from</span> <span className="text-[#10B981]">qiskit</span>{'\n'}
                        <span className="text-white">qc</span> = <span className="text-white">QuantumCircuit</span>(<span className="text-[#00D4FF]">6</span>){'\n'}
                        <span className="text-white/40"># apply {gateName}</span>{'\n'}
                        <span className="text-white">qc</span>.<span className="text-[#7C3AED]">{gateName.toLowerCase()}</span>(<span className="text-[#00D4FF]">qubit</span>)
                   </pre>
                   <button onClick={handleCopy} className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 p-1 rounded transition-colors text-white/60">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                   </button>
               </div>
           )}
       </div>
    </div>
  );
}
