import { create } from 'zustand';
import {
  createInitialState,
  applyGateToSystem,
  applyTwoQubitGate,
  getAllQubitBlochCoords,
  getMeasurementProbabilities,
  getStateVectorDisplay,
  getLinearAlgebraSteps
} from '../engine/quantumState.js';
import { TWO_QUBIT_GATES } from '../constants/gates.js';

const _initState = createInitialState();
const _initCoords = getAllQubitBlochCoords(_initState);
const _initProbs = getMeasurementProbabilities(_initState);

export const useQuantumStore = create((set, get) => ({
  stateVector: _initState,
  blochCoords: _initCoords,
  probabilities: _initProbs,
  stateDisplay: [],
  circuit: [[], [], [], [], [], []],
  activeQubit: 0,
  selectedGate: null,
  draggedGate: null,
  linearAlgebra: null,
  isAnimating: false,
  isEntangled: false,
  circuitDepth: 0,
  stateComplexity: 0,

  applyGate: (gateId, qubitIndex, timeStep, angle) => {
    const stateBefore = get().stateVector;
    const newState = applyGateToSystem(stateBefore, gateId, qubitIndex, angle);
    const coords = getAllQubitBlochCoords(newState);
    const probs = getMeasurementProbabilities(newState);
    const display = getStateVectorDisplay(newState);
    const algebra = getLinearAlgebraSteps(gateId, qubitIndex, stateBefore, newState, angle);
    
    // Polyfill crypto.randomUUID for broader browser compat if needed, but modern envs have it
    const newCircuit = structuredClone(get().circuit);
    newCircuit[qubitIndex].push({
      id: crypto.randomUUID(),
      gateId,
      qubitIndex,
      timeStep,
      angle,
      insertOrder: Date.now() + Math.random()
    });

    const isEntangled = newCircuit.flat().some(g => TWO_QUBIT_GATES[g.gateId]);
    const circuitDepth = Math.max(0, ...newCircuit.flat().map(g => g.timeStep)) + 1;

    set({
      stateVector: newState,
      blochCoords: coords,
      probabilities: probs,
      stateDisplay: display,
      linearAlgebra: algebra,
      circuit: newCircuit,
      activeQubit: qubitIndex,
      isAnimating: true,
      isEntangled,
      circuitDepth,
      stateComplexity: display.length
    });

    setTimeout(() => set({ isAnimating: false }), 400);
  },

  applyTwoQubitGate: (gateId, controlQubit, targetQubit, timeStep) => {
    const stateBefore = get().stateVector;
    const newState = applyTwoQubitGate(stateBefore, gateId, controlQubit, targetQubit);
    const coords = getAllQubitBlochCoords(newState);
    const probs = getMeasurementProbabilities(newState);
    const display = getStateVectorDisplay(newState);
    
    const newCircuit = structuredClone(get().circuit);
    newCircuit[targetQubit].push({
      id: crypto.randomUUID(),
      gateId,
      qubitIndex: targetQubit,
      controlQubit,
      timeStep,
      insertOrder: Date.now() + Math.random()
    });

    const isEntangled = newCircuit.flat().some(g => TWO_QUBIT_GATES[g.gateId]);
    const circuitDepth = Math.max(0, ...newCircuit.flat().map(g => g.timeStep)) + 1;

    set({
      stateVector: newState,
      blochCoords: coords,
      probabilities: probs,
      stateDisplay: display,
      linearAlgebra: null,
      circuit: newCircuit,
      activeQubit: targetQubit,
      isAnimating: true,
      isEntangled,
      circuitDepth,
      stateComplexity: display.length
    });

    setTimeout(() => set({ isAnimating: false }), 400);
  },

  _replayCircuit: (circuit) => {
    let state = createInitialState();
    const allGates = circuit.flat().sort((a, b) => a.insertOrder - b.insertOrder);
    for (const gate of allGates) {
      if (gate.controlQubit !== undefined) {
        state = applyTwoQubitGate(state, gate.gateId, gate.controlQubit, gate.qubitIndex);
      } else {
        state = applyGateToSystem(state, gate.gateId, gate.qubitIndex, gate.angle);
      }
    }
    return state;
  },

  removeGate: (gateInstanceId) => {
    const newCircuit = structuredClone(get().circuit);
    for (let i = 0; i < 6; i++) {
      newCircuit[i] = newCircuit[i].filter(g => g.id !== gateInstanceId);
    }
    
    const newState = get()._replayCircuit(newCircuit);
    const coords = getAllQubitBlochCoords(newState);
    const probs = getMeasurementProbabilities(newState);
    const display = getStateVectorDisplay(newState);
    const isEntangled = newCircuit.flat().some(g => TWO_QUBIT_GATES[g.gateId]);
    const circuitDepth = newCircuit.flat().length > 0 ? Math.max(...newCircuit.flat().map(g => g.timeStep)) + 1 : 0;

    set({
      stateVector: newState,
      blochCoords: coords,
      probabilities: probs,
      stateDisplay: display,
      circuit: newCircuit,
      isEntangled,
      circuitDepth,
      stateComplexity: display.length,
      linearAlgebra: null
    });
  },

  undo: () => {
    const allGates = get().circuit.flat().sort((a, b) => a.insertOrder - b.insertOrder);
    if (allGates.length === 0) return;
    const lastGate = allGates[allGates.length - 1];
    get().removeGate(lastGate.id);
  },

  reset: () => {
    set({
      stateVector: _initState,
      blochCoords: _initCoords,
      probabilities: _initProbs,
      stateDisplay: [],
      circuit: [[], [], [], [], [], []],
      selectedGate: null,
      draggedGate: null,
      linearAlgebra: null,
      isAnimating: false,
      isEntangled: false,
      circuitDepth: 0,
      stateComplexity: 0
    });
  },

  setActiveQubit: (i) => set({ activeQubit: i }),
  setDraggedGate: (id) => set({ draggedGate: id }),
  setSelectedGate: (id) => set({ selectedGate: id })
}));
