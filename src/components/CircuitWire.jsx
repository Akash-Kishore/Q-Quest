import React, { useState } from 'react';
import { SINGLE_GATES, TWO_QUBIT_GATES } from '../constants/gates.js';
import { COLORS } from '../constants/colors.js';
// Hack for coloring directly:
const getGateInfo = (gid) => SINGLE_GATES[gid] || TWO_QUBIT_GATES[gid];

export default function CircuitWire({ 
  qubitIndex, 
  gates, 
  isActive, 
  onDrop, 
  onRemove, 
  onActivate, 
  draggedGate, 
  maxTimeSteps,
  onClickCell,
  isPendingControl,
  allCircuitData
}) {
  const [hoverIndex, setHoverIndex] = useState(null);
  
  // Create a map of timestep -> gate for quick lookup
  const gateMap = {};
  gates.forEach(g => { gateMap[g.timeStep] = g; });

  // Also need to know if this wire is the TARGET of a 2-qubit gate on another wire
  const targetMap = {};
  allCircuitData.forEach((wire, ctrlIdx) => {
      wire.forEach(g => {
          if (g.targetQubit === qubitIndex) {
              targetMap[g.timeStep] = { ...g, controlQubit: ctrlIdx };
          }
      });
  });

  const cells = [];
  for (let t = 0; t < maxTimeSteps; t++) {
     cells.push(t);
  }

  const handleDragOver = (e, t) => {
      e.preventDefault();
      if (!gateMap[t] && !targetMap[t]) {
          setHoverIndex(t);
      }
  };

  const handleDragLeave = (e) => {
      e.preventDefault();
      setHoverIndex(null);
  };

  const handleDropEvent = (e, t) => {
      e.preventDefault();
      setHoverIndex(null);
      if (gateMap[t] || targetMap[t]) return;

      const data = e.dataTransfer.getData('application/json');
      if (data) {
          const { gateId } = JSON.parse(data);
          onDrop(gateId, qubitIndex, t);
      }
  };

  return (
      <div 
         className={`flex relative h-16 w-max min-w-full items-center group
             ${isActive ? 'bg-[#00D4FF]/5' : 'hover:bg-white/[0.02]'} 
             transition-colors duration-150 border-b border-white/5
             ${isPendingControl ? 'bg-[#F97316]/10' : ''}`}
         onClick={(e) => {
            // Only activate if we clicked the background, not a button
            if (e.target === e.currentTarget) onActivate(qubitIndex);
         }}
      >
          {/* Active / Pending Indicator Border */}
          <div className={`absolute left-0 top-0 bottom-0 w-1 
              ${isPendingControl ? 'bg-[#F97316]' : isActive ? 'bg-[#00D4FF]' : 'bg-transparent'}`} 
          />

          {/* Qubit Label */}
          <div className="w-16 shrink-0 flex items-center justify-center text-xs font-mono text-white/50 border-r border-white/5 pointer-events-none select-none">
             |0⟩ q[{qubitIndex}]
          </div>

          {/* Wire Background Line */}
          <div className="absolute left-16 right-0 h-px bg-white/20 top-1/2 -translate-y-1/2 z-0 pointer-events-none" />

          {/* Time Step Cells */}
          <div className="flex z-10 px-4 gap-2">
             {cells.map(t => {
                 const gate = gateMap[t];
                 const targetInfo = targetMap[t];
                 
                 const isHovered = hoverIndex === t && draggedGate;
                 const cellClasses = `w-12 h-12 flex items-center justify-center relative cursor-pointer
                    ${!gate && !targetInfo ? 'hover:bg-white/5 hover:border-white/20 border border-transparent border-dashed rounded' : ''}
                    ${isHovered ? 'bg-[#00D4FF]/20 border-[#00D4FF]' : ''}`;

                 return (
                     <div key={t} 
                          className={cellClasses}
                          onDragOver={(e) => handleDragOver(e, t)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDropEvent(e, t)}
                          onClick={() => (!gate && !targetInfo) && onClickCell(qubitIndex, t)}
                     >
                         {/* Control node for 2-qubit gate */}
                         {gate && gate.targetQubit !== undefined && (
                            <>
                              <div className="w-3 h-3 bg-white rounded-full z-20" />
                              <div className="absolute left-1/2 w-0.5 bg-white -translate-x-1/2 z-10" 
                                   style={{ 
                                       top: gate.targetQubit > qubitIndex ? '50%' : '-500%', 
                                       bottom: gate.targetQubit < qubitIndex ? '50%' : '-500%',
                                       height: `${Math.abs(gate.targetQubit - qubitIndex) * 64}px` // rough px calc
                                   }} 
                              />
                            </>
                         )}

                         {/* Normal Gate Chip */}
                         {gate && gate.targetQubit === undefined && (
                             <GateChipRender gate={gate} onRemove={() => onRemove(gate.id)} />
                         )}

                         {/* Target Node for 2-qubit gate */}
                         {targetInfo && (
                             <TargetNodeRender gateInfo={getGateInfo(targetInfo.gateId)} onRemove={() => onRemove(targetInfo.id)} />
                         )}
                         
                         {/* Hover cross for empty */}
                         {!gate && !targetInfo && (
                            <span className="text-white/20 text-xl font-light opacity-0 group-hover:opacity-100">+</span>
                         )}
                     </div>
                 );
             })}

             {/* Measurement end */}
             <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <div className="w-8 h-8 rounded bg-white/5 border border-white/20 flex items-center justify-center text-white/50 text-xs">
                   M
                </div>
             </div>
          </div>
      </div>
  );
}

function GateChipRender({ gate, onRemove }) {
    const info = getGateInfo(gate.gateId);
    if (!info) return null;
    return (
        <div className="w-10 h-10 rounded shadow flex items-center justify-center font-mono font-bold text-lg relative group"
             style={{ 
               backgroundColor: `${info.color}EE`, 
               color: '#fff',
               border: `1px solid ${info.color}`
             }}
        >
            {info.symbol}
            {gate.angle !== null && typeof gate.angle !== 'undefined' && info.hasAngle && (
                <span className="absolute -bottom-1.5 right-0 text-[8px] bg-black/80 px-1 rounded">{gate.angle === Math.PI/2 ? 'π/2' : 'θ'}</span>
            )}
            
            <button 
               onClick={(e) => { e.stopPropagation(); onRemove(); }}
               className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex"
            >
                ×
            </button>
        </div>
    );
}

function TargetNodeRender({ gateInfo, onRemove }) {
    if (!gateInfo) return null;
    
    // Renders the target UI part of a 2-qubit gate (e.g., the ⊕ for CNOT)
    let inner = null;
    if (gateInfo.id === 'CNOT') {
        inner = <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xl">⊕</div>;
    } else if (gateInfo.id === 'CZ') {
         inner = <div className="w-3 h-3 rounded-full bg-white flex items-center justify-center text-white text-xl"></div>;
    } else if (gateInfo.id === 'SWAP') {
        inner = <div className="text-white text-xl font-bold">×</div>;
    } else {
        inner = <div className="w-8 h-8 bg-white/20 rounded" />;
    }

    return (
        <div className="relative group w-full h-full flex items-center justify-center z-20">
            {inner}
            <button 
               onClick={(e) => { e.stopPropagation(); onRemove(); }}
               className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 flex"
            >
                ×
            </button>
        </div>
    );
}
