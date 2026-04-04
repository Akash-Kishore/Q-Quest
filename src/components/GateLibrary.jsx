import React, { useState } from 'react';
import { GATE_CATEGORIES, SINGLE_GATES, TWO_QUBIT_GATES } from '../constants/gates.js';
import useQuantumActions from '../hooks/useQuantumActions.js';

export default function GateLibrary() {
  const { setDraggedGate, setSelectedGate, selectedGate, undo, reset } = useQuantumActions();
  const [openCategories, setOpenCategories] = useState(
    Object.keys(GATE_CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const GateChip = ({ gateId }) => {
    const gateInfo = SINGLE_GATES[gateId] || TWO_QUBIT_GATES[gateId];
    if (!gateInfo) return null;
    
    const isSelected = selectedGate === gateId;

    return (
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/json', JSON.stringify({ gateId }));
          setDraggedGate(gateId);
        }}
        onDragEnd={() => setDraggedGate(null)}
        onClick={() => setSelectedGate(isSelected ? null : gateId)}
        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors duration-150
                   ${isSelected ? 'bg-white/15' : 'hover:bg-white/10'}`}
        title={gateInfo.analogy}
      >
        <div 
          className="w-10 h-10 rounded shadow-lg flex items-center justify-center font-mono font-bold text-lg"
          style={{ 
            backgroundColor: `${gateInfo.color}22`, 
            color: gateInfo.color,
            border: `1px solid ${gateInfo.color}44`,
            boxShadow: isSelected ? `0 0 12px ${gateInfo.color}44` : 'none'
          }}
        >
          {gateInfo.symbol}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm text-white/80 font-medium truncate">{gateInfo.name}</span>
          <span className="text-[10px] text-white/40 truncate">{gateInfo.hasAngle ? 'Parameterized' : 'Fixed'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="glass h-full flex flex-col pt-4 overflow-hidden">
      <h2 className="px-4 text-xs font-mono font-bold text-white/50 tracking-widest mb-4 flex-shrink-0">
        QUANTUM GATES
      </h2>

      <div className="flex-1 overflow-y-auto px-2 space-y-2 pb-4 scrollbar-thin">
        {Object.entries(GATE_CATEGORIES).map(([category, gateIds]) => (
          <div key={category} className="mb-2">
            <button 
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-white/40 hover:text-white/70 transition-colors uppercase font-mono tracking-wider"
            >
              <span>{category}</span>
              <span>{openCategories[category] ? '▼' : '▶'}</span>
            </button>
            
            {openCategories[category] && (
              <div className="space-y-1 mt-1">
                {gateIds.map(id => <GateChip key={id} gateId={id} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10 flex gap-2 flex-shrink-0">
        <button 
          onClick={undo}
          className="flex-1 py-2 rounded-lg border border-white/10 hover:border-[#00D4FF]/50 text-xs font-medium text-white/60 hover:text-[#00D4FF] hover:bg-[#00D4FF]/5 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
        >
           <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
           Undo
        </button>
        <button 
          onClick={reset}
          className="flex-1 py-2 rounded-lg border border-red-500/20 hover:border-red-500/50 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Reset
        </button>
      </div>
    </div>
  );
}
