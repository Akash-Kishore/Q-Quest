import { useQuantumStore } from '../store/quantumStore.js';

export default function useQuantumActions() {
  const applyGate = useQuantumStore(s => s.applyGate);
  const applyTwoQubitGate = useQuantumStore(s => s.applyTwoQubitGate);
  const removeGate = useQuantumStore(s => s.removeGate);
  const setActiveQubit = useQuantumStore(s => s.setActiveQubit);
  const setDraggedGate = useQuantumStore(s => s.setDraggedGate);
  const setSelectedGate = useQuantumStore(s => s.setSelectedGate);
  const reset = useQuantumStore(s => s.reset);
  const undo = useQuantumStore(s => s.undo);

  const activeQubit = useQuantumStore(s => s.activeQubit);
  const selectedGate = useQuantumStore(s => s.selectedGate);
  const draggedGate = useQuantumStore(s => s.draggedGate);
  const circuit = useQuantumStore(s => s.circuit);
  const isAnimating = useQuantumStore(s => s.isAnimating);
  const isEntangled = useQuantumStore(s => s.isEntangled);
  const circuitDepth = useQuantumStore(s => s.circuitDepth);

  return {
    applyGate,
    applyTwoQubitGate,
    removeGate,
    setActiveQubit,
    setDraggedGate,
    setSelectedGate,
    reset,
    undo,
    activeQubit,
    selectedGate,
    draggedGate,
    circuit,
    isAnimating,
    isEntangled,
    circuitDepth
  };
}
