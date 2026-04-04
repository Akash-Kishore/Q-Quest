import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import BlochSphereScene from './BlochSphereScene.jsx';
import useQuantumActions from '../../hooks/useQuantumActions.js';
import { TWO_QUBIT_GATES } from '../../constants/gates.js';

export default function MiniBlochRow() {
  const { activeQubit, setActiveQubit, circuit, isAnimating } = useQuantumActions();
  const svgRef = useRef(null);

  useEffect(() => {
    // Generate entanglement pairs based on two-qubit gates currently in the circuit
    const pairs = [];
    circuit.forEach((wire, targetIdx) => {
      wire.forEach(gate => {
        if (TWO_QUBIT_GATES[gate.gateId] && gate.controlQubit !== undefined) {
          pairs.push({ src: Math.min(gate.controlQubit, targetIdx), dst: Math.max(gate.controlQubit, targetIdx) });
        }
      });
    });

    const svg = svgRef.current;
    if (!svg) return;
    
    // Clear existing arcs
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Draw SVG arcs between entangled qubits
    const qWidth = 88; // 80px width + 8px gap
    pairs.forEach(({ src, dst }) => {
      const x1 = src * qWidth + 40;
      const x2 = dst * qWidth + 40;
      const y = 40;
      
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const cx = (x1 + x2) / 2;
      const dy = Math.abs(x2 - x1) * 0.4;
      
      path.setAttribute('d', `M ${x1} ${y} Q ${cx} ${y + dy} ${x2} ${y}`);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#00D4FF');
      path.setAttribute('stroke-width', '1.5');
      path.setAttribute('stroke-dasharray', '4 4');
      path.classList.add('entanglement-line');
      
      if (isAnimating) {
         path.style.opacity = '0.8';
      } else {
         path.style.opacity = '0.3';
      }
      
      svg.appendChild(path);
    });
  }, [circuit, isAnimating]);

  return (
    <div className="relative w-full flex gap-2">
      <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div 
          key={i} 
          onClick={() => setActiveQubit(i)}
          className={`relative cursor-pointer rounded-lg border transition-all duration-300 w-20 flex-shrink-0
             ${activeQubit === i ? 'border-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.2)] bg-black/40' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
          style={{ height: 80 }}
        >
          <span className="absolute top-1 left-1.5 text-[9px] font-mono text-white/40 z-20 pointer-events-none">
            q[{i}]
          </span>
          <Canvas
             camera={{ position: [2, 1, 2], fov: 45 }}
             gl={{ alpha: true, antialias: false }}
             dpr={[1, 1]}
             className="z-0"
             style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.2} />
            <pointLight position={[3, 3, 3]} intensity={0.5} color={0x00D4FF} />
            <BlochSphereScene qubitIndex={i} mini={true} />
          </Canvas>
        </div>
      ))}
    </div>
  );
}
