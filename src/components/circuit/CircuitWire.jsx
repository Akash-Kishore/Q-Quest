import React, { useState } from 'react';
import { SINGLE_GATES, TWO_QUBIT_GATES } from '../../constants/gates.js';

const getGateInfo = (gid) => SINGLE_GATES[gid] || TWO_QUBIT_GATES[gid];

export default function CircuitWire({ 
  qubitIndex, 
  gates, 
  isActive, 
  isPendingControl,
  onDrop, 
  onRemove, 
  onActivate, 
  draggedGate, 
  maxTimeSteps,
  onClickCell,
  allCircuitData
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  
  const gateMap = {};
  gates.forEach(g => { gateMap[g.timeStep] = g; });

  const targetMap = {};
  allCircuitData.forEach((wire, ctrlIdx) => {
      wire.forEach(g => {
          if (g.controlQubit !== undefined && g.qubitIndex === qubitIndex) {
              targetMap[g.timeStep] = { ...g, controlQubit: ctrlIdx };
          }
      });
  });

  const handleDragOver = (e, t) => {
      e.preventDefault();
      if (!gateMap[t] && !targetMap[t]) {
          setHoveredCell(t);
      }
  };

  const handleDropEvent = (e, t) => {
      e.preventDefault();
      setHoveredCell(null);
      if (gateMap[t] || targetMap[t]) return;

      const data = e.dataTransfer.getData('application/json');
      if (data) {
          const { gateId } = JSON.parse(data);
          onDrop(gateId, qubitIndex, t);
          e.currentTarget.classList.add('gate-snap');
          const wireRef = e.currentTarget.parentElement.previousElementSibling;
          if (wireRef) {
              wireRef.classList.remove('wire-pulse');
              void wireRef.offsetWidth; // trigger reflow
              wireRef.classList.add('wire-pulse');
          }
          setTimeout(() => e.currentTarget.classList.remove('gate-snap'), 240);
      }
  };

  return (
      <div 
         className={`flex relative h-16 w-max min-w-full items-center group
             ${isActive ? 'bg-[#00D4FF]/5' : ''} 
             transition-colors duration-150
             ${isPendingControl ? 'border-l-2 border-[#F97316]' : isActive ? 'border-l-2 border-[#00D4FF] shadow-[inset_2px_0_8px_rgba(0,212,255,0.1)]' : 'border-l-2 border-transparent'}`}
         onClick={(e) => {
            if (e.target === e.currentTarget) onActivate(qubitIndex);
         }}
      >
          <div className="w-[88px] shrink-0 flex flex-col items-center justify-center font-mono border-r border-white/5 pointer-events-none select-none h-full">
             <span className="text-[10px] text-white/30">|0⟩</span>
             <span className="text-[10px] text-[#00D4FF]/40">q[{qubitIndex}]</span>
          </div>

          {/* Wire Background Line */}
          <div className="absolute left-[88px] right-0 h-px bg-white/10 top-1/2 -translate-y-1/2 z-0 pointer-events-none" />

          {/* Time Step Cells */}
          <div className="flex z-10 gap-2 h-full items-center px-1">
             {Array.from({ length: maxTimeSteps }).map((_, t) => {
                 const gate = gateMap[t];
                 const targetInfo = targetMap[t];
                 
                 const isHovered = hoveredCell === t;
                 const cellClasses = `w-12 h-12 flex items-center justify-center relative cursor-pointer
                    ${!gate && !targetInfo ? 'border border-transparent border-dashed rounded opacity-0 group-hover:opacity-100 hover:border-[#00D4FF]/30' : ''}
                    ${isHovered ? 'drag-active' : ''}`;

                 return (
                     <div key={t} 
                          className={cellClasses}
                          onDragOver={(e) => handleDragOver(e, t)}
                          onDragLeave={() => setHoveredCell(null)}
                          onDrop={(e) => handleDropEvent(e, t)}
                          onClick={() => (!gate && !targetInfo) && onClickCell(qubitIndex, t)}
                     >
                         {!gate && !targetInfo && (
                            <span className="text-white/5 text-[18px]">+</span>
                         )}

                         {gate && gate.controlQubit !== undefined && (
                            <>
                              <div className="w-2 h-2 bg-white rounded-full z-20" />
                              <div className="absolute left-1/2 w-0.5 bg-white -translate-x-1/2 z-10" 
                                   style={{ 
                                       top: gate.qubitIndex > gate.controlQubit ? '-500%' : '50%',
                                       bottom: gate.qubitIndex < gate.controlQubit ? '-500%' : '50%',
                                       height: `${Math.abs(gate.qubitIndex - gate.controlQubit) * 64}px`
                                   }} 
                              />
                            </>
                         )}

                         {gate && gate.controlQubit === undefined && (
                             <GateChipRender gate={gate} onRemove={() => onRemove(gate.id)} />
                         )}

                         {targetInfo && (
                             <TargetNodeRender gateInfo={getGateInfo(targetInfo.gateId)} onRemove={() => onRemove(targetInfo.id)} />
                         )}
                     </div>
                 );
             })}

             <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <span className="text-white/20 text-xl font-display font-light">⊙</span>
             </div>
          </div>
      </div>
  );
}

function GateChipRender({ gate, onRemove }) {
    const info = getGateInfo(gate.gateId);
    if (!info) return null;
    return (
        <div className="w-10 h-10 rounded shadow flex items-center justify-center font-mono font-medium text-xl relative group z-20"
             style={{ 
               backgroundColor: `${info.color}18`, 
               color: info.color,
               borderLeft: `2px solid ${info.color}`
             }}
        >
            {info.symbol}
            {gate.angle !== undefined && info.hasAngle && (
                <span className="absolute -bottom-1 -right-1 text-[7px] text-white/50 tracking-widest">{gate.angle === Math.PI/2 ? 'π/2' : 'θ'}</span>
            )}
            
            <button 
               onClick={(e) => { e.stopPropagation(); onRemove(); }}
               className="absolute inset-0 bg-white/80 rounded text-black text-2xl font-light items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
            >
                ×
            </button>
        </div>
    );
}

function TargetNodeRender({ gateInfo, onRemove }) {
    if (!gateInfo) return null;
    
    let inner = null;
    if (gateInfo.id === 'CNOT') {
        inner = <div className="w-8 h-8 rounded-full border border-white flex items-center justify-center text-white text-xl bg-[#0A0A0B]">⊕</div>;
    } else if (gateInfo.id === 'CZ') {
         inner = <div className="w-2 h-2 rounded-full bg-white relative z-20"></div>;
    } else if (gateInfo.id === 'SWAP') {
        inner = <div className="text-white text-2xl font-light">×</div>;
    }

    return (
        <div className="relative group w-full h-full flex items-center justify-center z-20">
            {inner}
            <button 
               onClick={(e) => { e.stopPropagation(); onRemove(); }}
               className="absolute inset-2 bg-white/80 rounded text-black text-xl font-light items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 flex"
            >
                ×
            </button>
        </div>
    );
}
