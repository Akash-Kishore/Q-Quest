import React, { useState } from 'react';
import { GATE_CATEGORIES, SINGLE_GATES, TWO_QUBIT_GATES } from '../../constants/gates.js';
import useQuantumActions from '../../hooks/useQuantumActions.js';

export default function GateLibrary() {
  const { setDraggedGate, setSelectedGate, selectedGate, undo, reset } = useQuantumActions();
  const [openCategories, setOpenCategories] = useState(
    Object.keys(GATE_CATEGORIES).reduce((acc, cat) => ({ ...acc, [cat]: true }), {})
  );

  const toggleCategory = (cat) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleMouseMove = (e) => {
    const chip = e.currentTarget;
    const rect = chip.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    chip.style.transform = `perspective(400px) rotateX(${-dy * 0.04}deg) rotateY(${dx * 0.04}deg)`;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'perspective(400px) rotateX(0) rotateY(0)';
  };

  const GateChip = ({ gateId }) => {
    const gateInfo = SINGLE_GATES[gateId] || TWO_QUBIT_GATES[gateId];
    if (!gateInfo) return null;
    
    const isSelected = selectedGate === gateId;

    return (
      <div className="mb-1">
        <div
          data-gate-chip="true"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData('application/json', JSON.stringify({ gateId }));
            setDraggedGate(gateId);
          }}
          onDragEnd={() => setDraggedGate(null)}
          onClick={() => setSelectedGate(isSelected ? null : gateId)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`w-full flex items-center gap-3 px-3 py-2 cursor-grab active:cursor-grabbing transition-all duration-200
                     ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
          style={{
             borderLeft: `2px solid ${gateInfo.color}`,
             boxShadow: isSelected ? `inset 2px 0 8px ${gateInfo.color}40` : 'none'
          }}
          title={gateInfo.analogy}
        >
          <div className="w-10 h-10 flex items-center justify-center font-mono font-bold text-xl drop-shadow-md"
               style={{ color: gateInfo.color }}>
            {gateInfo.symbol}
          </div>
          <div className="flex flex-col flex-1 text-right">
            <span className="text-[10px] text-white/30 truncate">{gateInfo.name}</span>
            <span className="text-[9px] text-white/20 uppercase tracking-widest">{gateInfo.hasAngle ? 'Parameterized' : 'Fixed'}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col pt-4 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {Object.entries(GATE_CATEGORIES).map(([category, gateIds]) => (
          <div key={category} className="mb-4">
            <button 
              onClick={() => toggleCategory(category)}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase font-mono tracking-[0.15em] mb-1"
            >
              <span>{category}</span>
              <span>{openCategories[category] ? '▼' : '▶'}</span>
            </button>
            
            <div style={{ display: openCategories[category] ? 'block' : 'none' }}>
              {gateIds.map(id => <GateChip key={id} gateId={id} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/[0.08] flex gap-2 flex-shrink-0">
        <button 
          onClick={undo}
          title="Undo last gate operation"
          className="flex-1 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all text-center flex items-center justify-center"
        >
           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
        </button>
        <button 
          onClick={reset}
          title="Reset completely"
          className="flex-1 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500/50 hover:text-red-400 transition-all text-center flex items-center justify-center"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      </div>
    </div>
  );
}
