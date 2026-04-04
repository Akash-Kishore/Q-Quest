import { useMemo } from 'react';
import { useQuantumStore } from '../store/quantumStore.js';

export default function useBlochAnimation(qubitIndex) {
  const coords = useQuantumStore(s => s.blochCoords[qubitIndex]);
  const isAnimating = useQuantumStore(s => s.isAnimating);

  return useMemo(() => ({
    target: { x: coords.x, y: coords.y, z: coords.z },
    purity: coords.purity,
    isAnimating
  }), [coords, isAnimating]);
}
