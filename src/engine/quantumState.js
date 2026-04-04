import {
  complexAbsSq,
  singleQubitSystemMatrix,
  twoQubitSystemMatrix,
  reducedDensityMatrix,
  matVecMulN
} from './quantumMath.js';
import { SINGLE_GATES, TWO_QUBIT_GATES } from '../constants/gates.js';

export const NUM_QUBITS = 6;
export const STATE_DIM = 64;

export function createInitialState() {
  const state = new Array(STATE_DIM).fill(null).map(() => ({ re: 0, im: 0 }));
  state[0] = { re: 1, im: 0 };
  return state;
}

export function applyGateToSystem(state, gateId, targetQubit, angle) {
  const gateInfo = SINGLE_GATES[gateId];
  if (!gateInfo) throw new Error(`Gate ${gateId} not found.`);

  const matrix = gateInfo.hasAngle ? gateInfo.matrixFn(angle) : gateInfo.matrix;
  const sysMat = singleQubitSystemMatrix(matrix, targetQubit, NUM_QUBITS);
  return matVecMulN(sysMat, state, STATE_DIM);
}

export function applyTwoQubitGate(state, gateId, controlQubit, targetQubit) {
  const gateInfo = TWO_QUBIT_GATES[gateId];
  if (!gateInfo) throw new Error(`Two-qubit gate ${gateId} not found.`);

  const sysMat = twoQubitSystemMatrix(gateInfo.matrix, controlQubit, targetQubit, NUM_QUBITS);
  return matVecMulN(sysMat, state, STATE_DIM);
}

export function getQubitBlochCoords(state, qubitIndex) {
  const rho = reducedDensityMatrix(state, qubitIndex, NUM_QUBITS);
  
  const x_b = 2 * rho[1].re;
  const y_b = -2 * rho[1].im;
  const z_b = rho[0].re - rho[3].re;
  
  const rawPurity = Math.sqrt(x_b * x_b + y_b * y_b + z_b * z_b);
  const purity = Math.min(1, Math.max(0, rawPurity));

  // Pole cases to prevent NaN
  if (purity < 1e-10) return { theta: 0, phi: 0, x: 0, y: 0, z: 0, purity: 0 };
  if (z_b > 1 - 1e-10) return { theta: 0, phi: 0, x: 0, y: 0, z: 1, purity };
  if (z_b < -1 + 1e-10) return { theta: Math.PI, phi: 0, x: 0, y: 0, z: -1, purity };

  const theta = Math.acos(Math.max(-1, Math.min(1, z_b / purity)));
  const phi = Math.atan2(y_b, x_b);

  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  return { theta, phi, x, y, z, purity };
}

export function getAllQubitBlochCoords(state) {
  const coords = [];
  for (let i = 0; i < NUM_QUBITS; i++) {
    coords.push(getQubitBlochCoords(state, i));
  }
  return coords;
}

export function getMeasurementProbabilities(state) {
  const probs = [];
  for (let i = 0; i < STATE_DIM; i++) {
    probs.push({
      basis: i.toString(2).padStart(NUM_QUBITS, '0'),
      probability: complexAbsSq(state[i])
    });
  }
  return probs;
}

export function getStateVectorDisplay(state) {
  const display = [];
  for (let i = 0; i < STATE_DIM; i++) {
    const prob = complexAbsSq(state[i]);
    if (prob > 1e-6) {
      display.push({
        index: i,
        basis: i.toString(2).padStart(NUM_QUBITS, '0'),
        amplitude: state[i],
        phase: Math.atan2(state[i].im, state[i].re),
        probability: prob
      });
    }
  }
  return display.sort((a, b) => b.probability - a.probability);
}

export function getLinearAlgebraSteps(gateId, targetQubit, stateBefore, stateAfter, angle) {
  const gateInfo = SINGLE_GATES[gateId];
  if (!gateInfo) return null;

  const matrix = gateInfo.hasAngle ? gateInfo.matrixFn(angle) : gateInfo.matrix;
  
  const factors = [];
  for (let i = NUM_QUBITS - 1; i >= 0; i--) {
    factors.push(i === targetQubit ? gateInfo.latexSymbol : 'I');
  }
  const tensorNotation = factors.join(' ⊗ ');

  return {
    gateName: gateInfo.name,
    gateMatrix: matrix,
    tensorNotation,
    inputAmplitudes: stateBefore.slice(0, 8),
    outputAmplitudes: stateAfter.slice(0, 8),
    latexExpression: gateInfo.latexSymbol,
    description: gateInfo.description,
    qiskitCode: gateInfo.qiskitCode.replace('qubit', targetQubit),
    analogy: gateInfo.analogy
  };
}
