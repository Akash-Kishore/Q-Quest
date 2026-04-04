import React from 'react';
import { Canvas } from '@react-three/fiber';
import BlochSphereScene from './BlochSphereScene.jsx';
import useQuantumActions from '../hooks/useQuantumActions.js';

export default function MiniBlochRow() {
  const { activeQubit, setActiveQubit } = useQuantumActions();
  const numQubits = 6;

  return (
    <div className="flex gap-2">
      {Array.from({ length: numQubits }).map((_, i) => (
        <div 
          key={i} 
          onClick={() => setActiveQubit(i)}
          className={`relative cursor-pointer rounded-lg border transition-colors duration-200
             ${activeQubit === i ? 'border-[#00D4FF] bg-[#00D4FF]/5' : 'border-white/10 hover:border-white/30'}`}
          style={{ width: 80, height: 80 }}
        >
          <span className="absolute top-1 left-1.5 text-[10px] font-mono text-white/50 z-10 select-none pointer-events-none">
            q[{i}]
          </span>
          <Canvas
             camera={{ position: [2, 1, 2], fov: 45 }}
             gl={{ alpha: true, antialias: false }} // false for perf on minis
             onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
             style={{ background: 'transparent', width: '100%', height: '100%', outline: 'none' }}
          >
            <BlochSphereScene qubitIndex={i} mini={true} />
          </Canvas>
        </div>
      ))}
    </div>
  );
}
