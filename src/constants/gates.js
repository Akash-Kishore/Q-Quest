const INV_SQRT2 = 1 / Math.sqrt(2);
const COS_PI4 = Math.cos(Math.PI / 4);
const SIN_PI4 = Math.sin(Math.PI / 4);

/* Gate: I | I†I = I ✓ */
const I = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 1, im: 0 }]
];

/* Gate: X | X†X = I ✓ */
const X = [
  [{ re: 0, im: 0 }, { re: 1, im: 0 }],
  [{ re: 1, im: 0 }, { re: 0, im: 0 }]
];

/* Gate: Y | Y†Y = I ✓ */
const Y = [
  [{ re: 0, im: 0 }, { re: 0, im: -1 }],
  [{ re: 0, im: 1 }, { re: 0, im: 0 }]
];

/* Gate: Z | Z†Z = I ✓ */
const Z = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: -1, im: 0 }]
];

/* Gate: H | H†H = I ✓ */
const H = [
  [{ re: INV_SQRT2, im: 0 }, { re: INV_SQRT2, im: 0 }],
  [{ re: INV_SQRT2, im: 0 }, { re: -INV_SQRT2, im: 0 }]
];

/* Gate: S | S†S = I ✓ */
const S = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 1 }]
];

/* Gate: T | T†T = I ✓ */
const T = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: COS_PI4, im: SIN_PI4 }]
];

const RX = (theta) => [
  [{ re: Math.cos(theta / 2), im: 0 }, { re: 0, im: -Math.sin(theta / 2) }],
  [{ re: 0, im: -Math.sin(theta / 2) }, { re: Math.cos(theta / 2), im: 0 }]
];

const RY = (theta) => [
  [{ re: Math.cos(theta / 2), im: 0 }, { re: -Math.sin(theta / 2), im: 0 }],
  [{ re: Math.sin(theta / 2), im: 0 }, { re: Math.cos(theta / 2), im: 0 }]
];

const RZ = (theta) => [
  [{ re: Math.cos(theta / 2), im: -Math.sin(theta / 2) }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: Math.cos(theta / 2), im: Math.sin(theta / 2) }]
];

const P = (phi) => [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: Math.cos(phi), im: Math.sin(phi) }]
];

/* Gate: CNOT | CNOT†CNOT = I ✓ */
const CNOT = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }]
];

/* Gate: CZ | CZ†CZ = I ✓ */
const CZ = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: -1, im: 0 }]
];

/* Gate: SWAP | SWAP†SWAP = I ✓ */
const SWAP = [
  [{ re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 1, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }],
  [{ re: 0, im: 0 }, { re: 0, im: 0 }, { re: 0, im: 0 }, { re: 1, im: 0 }]
];

export const SINGLE_GATES = {
  I: {
    id: 'I',
    name: 'Identity',
    symbol: 'I',
    matrix: I,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#4B5563',
    description: 'Leaves the qubit state unchanged.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'I',
    qiskitCode: 'qc.id(qubit)',
    analogy: 'Doing absolutely nothing.'
  },
  X: {
    id: 'X',
    name: 'Pauli-X',
    symbol: 'X',
    matrix: X,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#EF4444',
    description: 'Bit-flip gate. Flips |0⟩ to |1⟩ and vice versa.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'X',
    qiskitCode: 'qc.x(qubit)',
    analogy: 'Flipping a coin upside down.'
  },
  Y: {
    id: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    matrix: Y,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#A855F7',
    description: 'Bit and phase flip. Rotates π around Y-axis.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'Y',
    qiskitCode: 'qc.y(qubit)',
    analogy: 'Rotating a coin 180 degrees around its vertical axis.'
  },
  Z: {
    id: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    matrix: Z,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#3B82F6',
    description: 'Phase-flip gate. Adds a phase of π to |1⟩.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'Z',
    qiskitCode: 'qc.z(qubit)',
    analogy: 'Flipping the direction you are facing without moving.'
  },
  H: {
    id: 'H',
    name: 'Hadamard',
    symbol: 'H',
    matrix: H,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#00D4FF',
    description: 'Creates equal superposition of |0⟩ and |1⟩.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'H',
    qiskitCode: 'qc.h(qubit)',
    analogy: 'Flips a coin — puts the qubit in both states simultaneously.'
  },
  S: {
    id: 'S',
    name: 'S (Phase)',
    symbol: 'S',
    matrix: S,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#7C3AED',
    description: 'Quarter-turn phase gate. Applies i phase to |1⟩.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'S',
    qiskitCode: 'qc.s(qubit)',
    analogy: 'Turning 90 degrees to the left.'
  },
  T: {
    id: 'T',
    name: 'T (π/8)',
    symbol: 'T',
    matrix: T,
    matrixFn: null,
    category: 'Single Qubit',
    color: '#06B6D4',
    description: 'Eighth-turn phase gate. Applies e^(iπ/4) phase to |1⟩.',
    qubits: 1,
    hasAngle: false,
    latexSymbol: 'T',
    qiskitCode: 'qc.t(qubit)',
    analogy: 'Turning 45 degrees to the left.'
  },
  RX: {
    id: 'RX',
    name: 'RX Rotation',
    symbol: 'RX',
    matrix: null,
    matrixFn: RX,
    category: 'Rotation',
    color: '#F59E0B',
    description: 'Rotation around the X-axis by angle θ.',
    qubits: 1,
    hasAngle: true,
    latexSymbol: 'R_x(\\theta)',
    qiskitCode: 'qc.rx(theta, qubit)',
    analogy: 'Pitching an airplane nose up or down.'
  },
  RY: {
    id: 'RY',
    name: 'RY Rotation',
    symbol: 'RY',
    matrix: null,
    matrixFn: RY,
    category: 'Rotation',
    color: '#10B981',
    description: 'Rotation around the Y-axis by angle θ.',
    qubits: 1,
    hasAngle: true,
    latexSymbol: 'R_y(\\theta)',
    qiskitCode: 'qc.ry(theta, qubit)',
    analogy: 'Rolling an airplane left or right.'
  },
  RZ: {
    id: 'RZ',
    name: 'RZ Rotation',
    symbol: 'RZ',
    matrix: null,
    matrixFn: RZ,
    category: 'Rotation',
    color: '#EC4899',
    description: 'Rotation around the Z-axis by angle θ.',
    qubits: 1,
    hasAngle: true,
    latexSymbol: 'R_z(\\theta)',
    qiskitCode: 'qc.rz(theta, qubit)',
    analogy: 'Yawing an airplane left or right.'
  },
  P: {
    id: 'P',
    name: 'Phase Gate',
    symbol: 'P',
    matrix: null,
    matrixFn: P,
    category: 'Rotation',
    color: '#8B5CF6',
    description: 'Applies arbitrary phase φ to |1⟩.',
    qubits: 1,
    hasAngle: true,
    latexSymbol: 'P(\\phi)',
    qiskitCode: 'qc.p(phi, qubit)',
    analogy: 'Waiting a specific amount of time for a spinning top.'
  }
};

export const TWO_QUBIT_GATES = {
  CNOT: {
    id: 'CNOT',
    name: 'Controlled-X',
    symbol: 'CX',
    matrix: CNOT,
    matrixFn: null,
    category: 'Two Qubit',
    color: '#F97316',
    description: 'Flips target qubit if control qubit is |1⟩.',
    qubits: 2,
    hasAngle: false,
    latexSymbol: 'CX',
    qiskitCode: 'qc.cx(control, target)',
    analogy: 'IF control switch is ON, flip the target switch.'
  },
  CZ: {
    id: 'CZ',
    name: 'Controlled-Z',
    symbol: 'CZ',
    matrix: CZ,
    matrixFn: null,
    category: 'Two Qubit',
    color: '#14B8A6',
    description: 'Applies Z to target qubit if control is |1⟩.',
    qubits: 2,
    hasAngle: false,
    latexSymbol: 'CZ',
    qiskitCode: 'qc.cz(control, target)',
    analogy: 'Share a combined phase only if both are in state |1⟩.'
  },
  SWAP: {
    id: 'SWAP',
    name: 'SWAP Gate',
    symbol: 'SWAP',
    matrix: SWAP,
    matrixFn: null,
    category: 'Two Qubit',
    color: '#6366F1',
    description: 'Exchanges the states of two qubits.',
    qubits: 2,
    hasAngle: false,
    latexSymbol: 'SWAP',
    qiskitCode: 'qc.swap(qubit1, qubit2)',
    analogy: 'Two people trading their exact positions.'
  }
};

export const GATE_CATEGORIES = {
  'Single Qubit': ['I', 'X', 'Y', 'Z', 'H', 'S', 'T'],
  'Rotation': ['RX', 'RY', 'RZ', 'P'],
  'Two Qubit': ['CNOT', 'CZ', 'SWAP'],
};
