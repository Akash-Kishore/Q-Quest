import React, { useState } from 'react';
import useQuantumActions from '../hooks/useQuantumActions.js';
import CircuitWire from './CircuitWire.jsx';
import { TWO_QUBIT_GATES } from '../constants/gates.js';

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

  // For 2-qubit gate placement via click
  const [pendingControlQubit, setPendingControlQubit] = useState(null);

  // Determine max timesteps needed to render (pad by at least 15)
  const maxTimeInCircuit = Math.max(0, ...circuit.flat().map(g => g.timeStep));
  const renderTimeSteps = Math.max(15, maxTimeInCircuit + 4); 

  const handleDrop = (gateId, qubitIndex, timeStep) => {
     if (TWO_QUBIT_GATES[gateId]) {
         // UI simplification: If dropping a 2-qubit gate, treat the drop row as control, and target is control+1 (mod 6)
         const target = (qubitIndex + 1) % 6;
         applyTwoQubitGate(gateId, qubitIndex, target, timeStep);
     } else {
         // Parameterized gates default to Math.PI / 2
         // Note: Would need a UI modal for angle input in a full robust app
         applyGate(gateId, qubitIndex, timeStep, Math.PI / 2); 
     }
  };

  const handleWireClick = (qubitIndex, timeStep) => {
     if (!selectedGate) return;

     if (TWO_QUBIT_GATES[selectedGate]) {
         if (pendingControlQubit === null) {
             setPendingControlQubit(qubitIndex);
         } else {
             if (pendingControlQubit !== qubitIndex) {
                 applyTwoQubitGate(selectedGate, pendingControlQubit, qubitIndex, timeStep);
             }
             setPendingControlQubit(null);
             setSelectedGate(null); // auto unselect
         }
     } else {
         applyGate(selectedGate, qubitIndex, timeStep, Math.PI / 2);
         // Keep selected for rapid placement
     }
  };

  return (
    <div className="glass h-full w-full flex flex-col p-4 overflow-hidden relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
         {pendingControlQubit !== null && (
             <div className="px-3 py-1 bg-[#F97316]/20 border border-[#F97316]/50 rounded text-xs text-[#F97316] font-mono animate-pulse">
                Select target wire for {selectedGate}
             </div>
         )}
      </div>

      <div className="flex-1 overflow-auto scrollbar-thin flex flex-col rounded-xl border border-white/5 bg-black/20">
         {circuit.map((wireGates, qIdx) => (
            <CircuitWire 
                key={qIdx}
                qubitIndex={qIdx}
                gates={wireGates}
                isActive={activeQubit === qIdx}
                onDrop={handleDrop}
                onRemove={removeGate}
                onActivate={setActiveQubit}
                draggedGate={draggedGate}
                maxTimeSteps={renderTimeSteps}
                onClickCell={handleWireClick}
                isPendingControl={pendingControlQubit === qIdx}
                allCircuitData={circuit} // Needed for 2-q gate rendering connectors
            />
         ))}
      </div>
    </div>
  );
}
