export type Complex = { re: number; im: number };
export type Matrix = Complex[][];

export type GateGroup = 'Essentials' | 'Phase' | 'Rotations' | 'Controlled' | 'Interactions' | 'Utility';

export type GateDefinition = {
  id: string;
  label: string;
  symbol: string;
  description: string;
  group: GateGroup;
  arity: 1 | 2;
  parameter?: string;
  defaultParameter?: number;
  kind?: 'unitary' | 'measurement' | 'barrier';
  matrix: (parameter?: number) => Matrix;
};

export type PlacedGate = {
  id: string;
  gateId: string;
  column: number;
  targets: number[];
  parameter?: number;
};

export type SimulationStep = {
  gate: PlacedGate;
  definition: GateDefinition;
  state: Complex[];
  localMatrix: Matrix | null;
  systemMatrix: Matrix | null;
  cumulativeMatrix: Matrix;
};

const c = (re: number, im = 0): Complex => ({ re, im });
const ZERO = c(0);
const ONE = c(1);

export const add = (a: Complex, b: Complex): Complex => c(a.re + b.re, a.im + b.im);
export const multiply = (a: Complex, b: Complex): Complex =>
  c(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const magnitudeSquared = (value: Complex) => value.re * value.re + value.im * value.im;

export function blochCoordinates(state: Complex[], qubit: number) {
  const qubitCount = Math.round(Math.log2(state.length));
  if (2 ** qubitCount !== state.length || qubit < 0 || qubit >= qubitCount) {
    throw new Error('Bloch coordinates require a valid state vector and qubit index');
  }

  const mask = 1 << (qubitCount - 1 - qubit);
  let x = 0;
  let y = 0;
  let z = 0;
  for (let index = 0; index < state.length; index += 1) {
    if ((index & mask) !== 0) continue;
    const zero = state[index];
    const one = state[index | mask];
    x += 2 * (zero.re * one.re + zero.im * one.im);
    y += 2 * (zero.re * one.im - zero.im * one.re);
    z += magnitudeSquared(zero) - magnitudeSquared(one);
  }
  return { x, y, z, length: Math.min(1, Math.hypot(x, y, z)) };
}

const phase = (angle: number) => c(Math.cos(angle), Math.sin(angle));

const matrix2 = (a: Complex, b: Complex, d: Complex, e: Complex): Matrix => [
  [a, b],
  [d, e],
];

const SQRT_HALF = 1 / Math.sqrt(2);

export const GATES: GateDefinition[] = [
  {
    id: 'id', label: 'Identity', symbol: 'I', group: 'Essentials', arity: 1,
    description: 'Preserves the qubit while occupying a time slice.',
    matrix: () => matrix2(ONE, ZERO, ZERO, ONE),
  },
  {
    id: 'h', label: 'Hadamard', symbol: 'H', group: 'Essentials', arity: 1,
    description: 'Creates or removes an equal superposition.',
    matrix: () => matrix2(c(SQRT_HALF), c(SQRT_HALF), c(SQRT_HALF), c(-SQRT_HALF)),
  },
  {
    id: 'x', label: 'Pauli X', symbol: 'X', group: 'Essentials', arity: 1,
    description: 'Quantum NOT: flips |0⟩ and |1⟩.',
    matrix: () => matrix2(ZERO, ONE, ONE, ZERO),
  },
  {
    id: 'y', label: 'Pauli Y', symbol: 'Y', group: 'Essentials', arity: 1,
    description: 'Bit and phase flip around the Y axis.',
    matrix: () => matrix2(ZERO, c(0, -1), c(0, 1), ZERO),
  },
  {
    id: 'z', label: 'Pauli Z', symbol: 'Z', group: 'Essentials', arity: 1,
    description: 'Flips the phase of the |1⟩ component.',
    matrix: () => matrix2(ONE, ZERO, ZERO, c(-1)),
  },
  {
    id: 'sx', label: 'Square root X', symbol: '√X', group: 'Essentials', arity: 1,
    description: 'A half-turn toward the Pauli-X operation.',
    matrix: () => matrix2(c(0.5, 0.5), c(0.5, -0.5), c(0.5, -0.5), c(0.5, 0.5)),
  },
  {
    id: 'sxdg', label: 'Square root X dagger', symbol: '√X†', group: 'Essentials', arity: 1,
    description: 'The inverse square-root X operation.',
    matrix: () => matrix2(c(0.5, -0.5), c(0.5, 0.5), c(0.5, 0.5), c(0.5, -0.5)),
  },
  {
    id: 's', label: 'S phase', symbol: 'S', group: 'Phase', arity: 1,
    description: 'Adds a π/2 phase to |1⟩.',
    matrix: () => matrix2(ONE, ZERO, ZERO, c(0, 1)),
  },
  {
    id: 'sdg', label: 'S dagger', symbol: 'S†', group: 'Phase', arity: 1,
    description: 'Inverse S gate; adds a −π/2 phase.',
    matrix: () => matrix2(ONE, ZERO, ZERO, c(0, -1)),
  },
  {
    id: 't', label: 'T phase', symbol: 'T', group: 'Phase', arity: 1,
    description: 'Adds a π/4 phase to |1⟩.',
    matrix: () => matrix2(ONE, ZERO, ZERO, phase(Math.PI / 4)),
  },
  {
    id: 'tdg', label: 'T dagger', symbol: 'T†', group: 'Phase', arity: 1,
    description: 'Inverse T gate; adds a −π/4 phase.',
    matrix: () => matrix2(ONE, ZERO, ZERO, phase(-Math.PI / 4)),
  },
  {
    id: 'p', label: 'Phase', symbol: 'P', group: 'Phase', arity: 1,
    description: 'Applies a configurable relative phase.', parameter: 'φ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => matrix2(ONE, ZERO, ZERO, phase(value)),
  },
  {
    id: 'rx', label: 'Rotate X', symbol: 'Rx', group: 'Rotations', arity: 1,
    description: 'Rotates the qubit around the Bloch X axis.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = Math.cos(value / 2);
      const si = Math.sin(value / 2);
      return matrix2(c(co), c(0, -si), c(0, -si), c(co));
    },
  },
  {
    id: 'ry', label: 'Rotate Y', symbol: 'Ry', group: 'Rotations', arity: 1,
    description: 'Rotates the qubit around the Bloch Y axis.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = Math.cos(value / 2);
      const si = Math.sin(value / 2);
      return matrix2(c(co), c(-si), c(si), c(co));
    },
  },
  {
    id: 'rz', label: 'Rotate Z', symbol: 'Rz', group: 'Rotations', arity: 1,
    description: 'Rotates the qubit around the Bloch Z axis.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => matrix2(phase(-value / 2), ZERO, ZERO, phase(value / 2)),
  },
  {
    id: 'cx', label: 'Controlled X', symbol: 'CX', group: 'Controlled', arity: 2,
    description: 'Flips the target when the control is |1⟩.',
    matrix: () => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO],
      [ZERO, ZERO, ZERO, ONE], [ZERO, ZERO, ONE, ZERO],
    ],
  },
  {
    id: 'cz', label: 'Controlled Z', symbol: 'CZ', group: 'Controlled', arity: 2,
    description: 'Adds a phase only when both qubits are |1⟩.',
    matrix: () => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO],
      [ZERO, ZERO, ONE, ZERO], [ZERO, ZERO, ZERO, c(-1)],
    ],
  },
  {
    id: 'swap', label: 'Swap', symbol: '×', group: 'Controlled', arity: 2,
    description: 'Exchanges the states of two qubits.',
    matrix: () => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ZERO, ONE, ZERO],
      [ZERO, ONE, ZERO, ZERO], [ZERO, ZERO, ZERO, ONE],
    ],
  },
  {
    id: 'cp', label: 'Controlled phase', symbol: 'CP', group: 'Controlled', arity: 2,
    description: 'Adds a configurable phase when both qubits are |1⟩.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO],
      [ZERO, ZERO, ONE, ZERO], [ZERO, ZERO, ZERO, phase(value)],
    ],
  },
  {
    id: 'crx', label: 'Controlled Rx', symbol: 'CRx', group: 'Controlled', arity: 2,
    description: 'Rotates the target around X when the control is |1⟩.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = c(Math.cos(value / 2));
      const si = c(0, -Math.sin(value / 2));
      return [[ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO], [ZERO, ZERO, co, si], [ZERO, ZERO, si, co]];
    },
  },
  {
    id: 'cry', label: 'Controlled Ry', symbol: 'CRy', group: 'Controlled', arity: 2,
    description: 'Rotates the target around Y when the control is |1⟩.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = c(Math.cos(value / 2));
      const si = c(Math.sin(value / 2));
      return [[ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO], [ZERO, ZERO, co, c(-si.re)], [ZERO, ZERO, si, co]];
    },
  },
  {
    id: 'crz', label: 'Controlled Rz', symbol: 'CRz', group: 'Controlled', arity: 2,
    description: 'Rotates the target around Z when the control is |1⟩.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ONE, ZERO, ZERO],
      [ZERO, ZERO, phase(-value / 2), ZERO], [ZERO, ZERO, ZERO, phase(value / 2)],
    ],
  },
  {
    id: 'iswap', label: 'iSwap', symbol: 'i×', group: 'Interactions', arity: 2,
    description: 'Swaps |01⟩ and |10⟩ while adding a phase of i.',
    matrix: () => [
      [ONE, ZERO, ZERO, ZERO], [ZERO, ZERO, c(0, 1), ZERO],
      [ZERO, c(0, 1), ZERO, ZERO], [ZERO, ZERO, ZERO, ONE],
    ],
  },
  {
    id: 'rxx', label: 'XX interaction', symbol: 'Rxx', group: 'Interactions', arity: 2,
    description: 'Entangles two qubits through an XX rotation.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = c(Math.cos(value / 2));
      const si = c(0, -Math.sin(value / 2));
      return [[co, ZERO, ZERO, si], [ZERO, co, si, ZERO], [ZERO, si, co, ZERO], [si, ZERO, ZERO, co]];
    },
  },
  {
    id: 'ryy', label: 'YY interaction', symbol: 'Ryy', group: 'Interactions', arity: 2,
    description: 'Entangles two qubits through a YY rotation.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => {
      const co = c(Math.cos(value / 2));
      const negativeI = c(0, -Math.sin(value / 2));
      const positiveI = c(0, Math.sin(value / 2));
      return [[co, ZERO, ZERO, positiveI], [ZERO, co, negativeI, ZERO], [ZERO, negativeI, co, ZERO], [positiveI, ZERO, ZERO, co]];
    },
  },
  {
    id: 'rzz', label: 'ZZ interaction', symbol: 'Rzz', group: 'Interactions', arity: 2,
    description: 'Entangles two qubits through a ZZ rotation.', parameter: 'θ', defaultParameter: Math.PI / 2,
    matrix: (value = Math.PI / 2) => [
      [phase(-value / 2), ZERO, ZERO, ZERO], [ZERO, phase(value / 2), ZERO, ZERO],
      [ZERO, ZERO, phase(value / 2), ZERO], [ZERO, ZERO, ZERO, phase(-value / 2)],
    ],
  },
  {
    id: 'measure', label: 'Measure', symbol: 'M', group: 'Utility', arity: 1,
    description: 'Marks a qubit for computational-basis measurement.', kind: 'measurement',
    matrix: () => [],
  },
  {
    id: 'barrier', label: 'Barrier', symbol: '║', group: 'Utility', arity: 1,
    description: 'Creates a visual compilation boundary.', kind: 'barrier',
    matrix: () => [],
  },
];

export const GATE_MAP = new Map(GATES.map((gate) => [gate.id, gate]));

export function identity(size: number): Matrix {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => (row === column ? ONE : ZERO))
  );
}

export function applyMatrixToState(
  state: Complex[],
  localMatrix: Matrix,
  targets: number[],
  qubitCount: number
): Complex[] {
  const result = Array.from({ length: state.length }, () => c(0));
  const localSize = 2 ** targets.length;

  for (let basis = 0; basis < state.length; basis += 1) {
    let inputLocal = 0;
    let clearedBasis = basis;
    targets.forEach((qubit) => {
      const bitPosition = qubitCount - 1 - qubit;
      inputLocal = (inputLocal << 1) | ((basis >> bitPosition) & 1);
      clearedBasis &= ~(1 << bitPosition);
    });

    for (let outputLocal = 0; outputLocal < localSize; outputLocal += 1) {
      let outputBasis = clearedBasis;
      targets.forEach((qubit, targetIndex) => {
        const bitPosition = qubitCount - 1 - qubit;
        const localBit = (outputLocal >> (targets.length - 1 - targetIndex)) & 1;
        outputBasis |= localBit << bitPosition;
      });
      result[outputBasis] = add(
        result[outputBasis],
        multiply(localMatrix[outputLocal][inputLocal], state[basis])
      );
    }
  }

  return result;
}

export function expandedMatrix(
  localMatrix: Matrix,
  targets: number[],
  qubitCount: number
): Matrix {
  const size = 2 ** qubitCount;
  const result = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => c(0))
  );

  for (let column = 0; column < size; column += 1) {
    const basis = Array.from({ length: size }, (_, row) => (row === column ? ONE : ZERO));
    const output = applyMatrixToState(basis, localMatrix, targets, qubitCount);
    output.forEach((value, row) => {
      result[row][column] = value;
    });
  }
  return result;
}

export function multiplyMatrices(left: Matrix, right: Matrix): Matrix {
  return left.map((_, row) =>
    right[0].map((__, column) => {
      let total = c(0);
      for (let index = 0; index < right.length; index += 1) {
        total = add(total, multiply(left[row][index], right[index][column]));
      }
      return total;
    })
  );
}

export function simulateCircuit(gates: PlacedGate[], qubitCount: number) {
  const size = 2 ** qubitCount;
  let state = Array.from({ length: size }, (_, index) => (index === 0 ? ONE : ZERO));
  let cumulativeMatrix = identity(size);
  const orderedGates = [...gates].sort(
    (a, b) => a.column - b.column || Math.min(...a.targets) - Math.min(...b.targets)
  );
  const steps: SimulationStep[] = [];

  orderedGates.forEach((gate) => {
    const definition = GATE_MAP.get(gate.gateId);
    if (!definition) return;
    const isUnitary = (definition.kind ?? 'unitary') === 'unitary';
    const localMatrix = isUnitary ? definition.matrix(gate.parameter) : null;
    const systemMatrix = localMatrix
      ? expandedMatrix(localMatrix, gate.targets, qubitCount)
      : null;
    if (localMatrix && systemMatrix) {
      state = applyMatrixToState(state, localMatrix, gate.targets, qubitCount);
      cumulativeMatrix = multiplyMatrices(systemMatrix, cumulativeMatrix);
    }
    steps.push({
      gate,
      definition,
      state: state.map((value) => ({ ...value })),
      localMatrix,
      systemMatrix,
      cumulativeMatrix,
    });
  });

  return { state, steps, finalMatrix: cumulativeMatrix };
}

export function formatComplex(value: Complex, precision = 3): string {
  const clean = (number: number) => (Math.abs(number) < 10 ** -(precision + 1) ? 0 : number);
  const re = clean(value.re);
  const im = clean(value.im);
  if (im === 0) return re.toFixed(precision).replace(/\.0+$/, '');
  if (re === 0) return `${im.toFixed(precision).replace(/\.0+$/, '')}i`;
  const imaginary = Math.abs(im).toFixed(precision).replace(/\.0+$/, '');
  return `${re.toFixed(precision).replace(/\.0+$/, '')}${im >= 0 ? '+' : '−'}${imaginary}i`;
}

export function basisLabel(index: number, qubitCount: number) {
  return `|${index.toString(2).padStart(qubitCount, '0')}⟩`;
}

export function toQasm(gates: PlacedGate[], qubitCount: number) {
  const usedGateIds = new Set(gates.map((gate) => gate.gateId));
  const customDefinitions = [
    usedGateIds.has('sxdg')
      ? 'gate sxdg a { inv @ sx a; }'
      : null,
    usedGateIds.has('iswap')
      ? 'gate iswap a, b { s a; s b; swap a, b; cz a, b; }'
      : null,
    usedGateIds.has('rxx')
      ? 'gate rxx(theta) a, b { h a; h b; cx a, b; rz(theta) b; cx a, b; h a; h b; }'
      : null,
    usedGateIds.has('ryy')
      ? 'gate ryy(theta) a, b { rx(pi / 2) a; rx(pi / 2) b; cx a, b; rz(theta) b; cx a, b; rx(-pi / 2) a; rx(-pi / 2) b; }'
      : null,
    usedGateIds.has('rzz')
      ? 'gate rzz(theta) a, b { cx a, b; rz(theta) b; cx a, b; }'
      : null,
  ].filter((definition): definition is string => Boolean(definition));

  const lines = [
    'OPENQASM 3.0;',
    'include "stdgates.inc";',
    ...customDefinitions,
    ...(customDefinitions.length ? [''] : []),
    `qubit[${qubitCount}] q;`,
    `bit[${qubitCount}] c;`,
    '',
  ];
  [...gates]
    .sort((a, b) => a.column - b.column || Math.min(...a.targets) - Math.min(...b.targets))
    .forEach((gate) => {
      const target = gate.targets.map((qubit) => `q[${qubit}]`).join(', ');
      const parameter = gate.parameter === undefined ? '' : `(${gate.parameter.toFixed(6)})`;
      if (gate.gateId === 'measure') {
        lines.push(`c[${gate.targets[0]}] = measure q[${gate.targets[0]}];`);
      } else if (gate.gateId === 'barrier') {
        lines.push(`barrier ${target};`);
      } else {
        lines.push(`${gate.gateId}${parameter} ${target};`);
      }
    });
  return lines.join('\n');
}

export const SAMPLE_CIRCUITS: Record<string, { label: string; qubits: number; gates: Omit<PlacedGate, 'id'>[] }> = {
  bell: {
    label: 'Bell pair', qubits: 2,
    gates: [
      { gateId: 'h', column: 0, targets: [0] },
      { gateId: 'cx', column: 1, targets: [0, 1] },
    ],
  },
  ghz: {
    label: 'GHZ state', qubits: 3,
    gates: [
      { gateId: 'h', column: 0, targets: [0] },
      { gateId: 'cx', column: 1, targets: [0, 1] },
      { gateId: 'cx', column: 2, targets: [1, 2] },
    ],
  },
  phase: {
    label: 'Phase lab', qubits: 2,
    gates: [
      { gateId: 'h', column: 0, targets: [0] },
      { gateId: 'rz', column: 1, targets: [0], parameter: Math.PI / 3 },
      { gateId: 'h', column: 2, targets: [1] },
      { gateId: 'cz', column: 3, targets: [0, 1] },
    ],
  },
};
