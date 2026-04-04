import React, { useState } from 'react';
import useQuantumActions from '../../hooks/useQuantumActions.js';
import { SINGLE_GATES, TWO_QUBIT_GATES } from '../../constants/gates.js';
import CircuitWire from './CircuitWire.jsx';

export default function CircuitBoard() {
  const { 
    circuit, 
    activeQubit,
    setActiveQubit, 
    applyGate, 
    applyTwoQubitGate,
    removeGate, 
    draggedGate,
    selectedGate,
    setSelectedGate
  } = useQuantumActions();

  const [pendingControl, setPendingControl] = useState(null); // { gateId, qubitIndex }

  const maxTimeInCircuit = Math.max(0, ...circuit.flat().map(g => g.timeStep));
  const renderTimeSteps = Math.max(20, maxTimeInCircuit + 6);

  const handleDrop = (gateId, qubitIndex, timeStep) => {
     if (TWO_QUBIT_GATES[gateId]) {
         const target = (qubitIndex + 1) % 6;
         applyTwoQubitGate(gateId, qubitIndex, target, timeStep);
     } else {
         const angle = SINGLE_GATES[gateId].hasAngle ? Math.PI / 2 : undefined;
         applyGate(gateId, qubitIndex, timeStep, angle); 
     }
  };

  const handleWireClick = (qubitIndex, timeStep) => {
     if (!selectedGate) return;

     if (TWO_QUBIT_GATES[selectedGate]) {
         if (!pendingControl) {
             setPendingControl({ gateId: selectedGate, qubitIndex });
         } else {
             if (pendingControl.qubitIndex !== qubitIndex) {
                 applyTwoQubitGate(selectedGate, pendingControl.qubitIndex, qubitIndex, timeStep);
             }
             setPendingControl(null);
             setSelectedGate(null);
         }
     } else {
         const angle = SINGLE_GATES[selectedGate].hasAngle ? Math.PI / 2 : undefined;
         applyGate(selectedGate, qubitIndex, timeStep, angle);
     }
  };

  return (
    <div 
      className="absolute inset-0 flex flex-col p-6 overflow-auto scrollbar-thin"
      style={{
        backgroundImage: `linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)`,
        backgroundSize: '48px 48px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && pendingControl) {
            setPendingControl(null);
        }
      }}
    >
      <div className="flex gap-2 mb-2 ml-[88px]">
        {Array.from({ length: renderTimeSteps }).map((_, i) => (
           <div key={i} className="w-12 shrink-0 text-center text-[9px] font-mono text-white/20">
              t{String(i).replace(/[0-9]/g, c => "₀₁₂₃₄₅₆₇₈₉"[c])}
           </div>
        ))}
      </div>

      <div className="flex flex-col flex-1 rounded-xl">
         {circuit.map((wireGates, qIdx) => (
            <CircuitWire 
                key={qIdx}
                qubitIndex={qIdx}
                gates={wireGates}
                isActive={activeQubit === qIdx}
                isPendingControl={pendingControl?.qubitIndex === qIdx}
                onDrop={handleDrop}
                onRemove={removeGate}
                onActivate={setActiveQubit}
                draggedGate={draggedGate}
                maxTimeSteps={renderTimeSteps}
                onClickCell={handleWireClick}
                allCircuitData={circuit}
            />
         ))}
      </div>
    </div>
  );
}
